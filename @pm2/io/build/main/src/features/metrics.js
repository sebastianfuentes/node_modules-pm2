"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meter_1 = require("../utils/metrics/meter");
const counter_1 = require("../utils/metrics/counter");
const histogram_1 = require("../utils/metrics/histogram");
const serviceManager_1 = require("../serviceManager");
const transport_1 = require("../utils/transport");
const constants_1 = require("../constants");
const metrics_1 = require("../services/metrics");
class MetricsFeature {
    constructor() {
        this._var = new Map();
        this.defaultAggregation = 'avg';
        this._started = false;
        this._alreadySentData = [];
        this.AVAILABLE_MEASUREMENTS = [
            'min',
            'max',
            'sum',
            'count',
            'variance',
            'mean',
            'stddev',
            'median',
            'p75',
            'p95',
            'p99',
            'p999'
        ];
        this._var = serviceManager_1.ServiceManager.get('metricsMap');
        serviceManager_1.ServiceManager.set('metricService', new metrics_1.default(this));
        this.metricService = serviceManager_1.ServiceManager.get('metricService');
    }
    init(config, force) {
        if (this._started === false) {
            this._started = true;
            const self = this;
            this.timer = setInterval(function () {
                const data = self._cookData(self._getVar());
                // don't send empty data
                if (Object.keys(data).length !== 0) {
                    transport_1.default.send({
                        type: 'axm:monitor',
                        data: data
                    });
                }
            }, constants_1.default.METRIC_INTERVAL);
            this.timer.unref();
        }
        this.metricService.init(config, force);
        return {
            histogram: this.histogram,
            meter: this.meter,
            counter: this.counter,
            metric: this.metric
        };
    }
    transpose(variableName, reporter) {
        if (typeof variableName === 'object') {
            reporter = variableName.data;
            variableName = variableName.name;
        }
        if (typeof reporter !== 'function') {
            console.error('[PM2 IO][Transpose] reporter is not a function');
            return undefined;
        }
        this._var.set(variableName, {
            value: reporter
        });
    }
    meter(opts) {
        if (!opts.name) {
            console.error('[PM2 IO][Meter] Name not defined');
            return undefined;
        }
        opts.unit = opts.unit || '';
        const meter = new meter_1.default(opts);
        this._var.set(opts.name, {
            value: function () {
                return meter.val() + `${opts.unit}`;
            },
            type: opts.type || opts.name,
            historic: this._historicEnabled(opts.historic),
            agg_type: opts.agg_type || this.defaultAggregation,
            unit: opts.unit
        });
        return meter;
    }
    counter(opts) {
        if (!opts.name) {
            console.error('[PM2 IO][Counter] Name not defined');
            return undefined;
        }
        const counter = new counter_1.default(opts);
        this._var.set(opts.name, {
            value: function () { return counter.val(); },
            type: opts.type || opts.name,
            historic: this._historicEnabled(opts.historic),
            agg_type: opts.agg_type || this.defaultAggregation,
            unit: opts.unit
        });
        return counter;
    }
    histogram(opts) {
        if (!opts.name) {
            console.error('[PM2 IO][Histogram] Name not defined');
            return undefined;
        }
        opts.measurement = opts.measurement || 'mean';
        opts.unit = opts.unit || '';
        if (this.AVAILABLE_MEASUREMENTS.indexOf(opts.measurement) === -1) {
            console.error('[PM2 IO][Histogram] Measure type %s does not exists', opts.measurement);
            return undefined;
        }
        const histogram = new histogram_1.default(opts);
        this._var.set(opts.name, {
            value: function () {
                return (Math.round(histogram.val() * 100) / 100) + `${opts.unit}`;
            },
            type: opts.type || opts.name,
            historic: this._historicEnabled(opts.historic),
            agg_type: opts.agg_type || this.defaultAggregation,
            unit: opts.unit
        });
        return histogram;
    }
    metric(opts) {
        if (!opts.name) {
            console.error('[PM2 IO][Metric] Name not defined');
            return undefined;
        }
        this._var.set(opts.name, {
            value: opts.value || 0,
            type: opts.type || opts.name,
            historic: this._historicEnabled(opts.historic),
            agg_type: opts.agg_type || this.defaultAggregation,
            unit: opts.unit
        });
        const self = this;
        return {
            val: function () {
                let value = self._var.get(opts.name).value;
                if (typeof (value) === 'function') {
                    value = value();
                }
                return value;
            },
            set: function (dt) {
                self._var.get(opts.name).value = dt;
            }
        };
    }
    deleteMetric(name) {
        this._var.delete(name);
        this._alreadySentData.splice(this._alreadySentData.indexOf(name), 1);
    }
    destroy() {
        clearInterval(this.timer);
        this._getVar().clear();
        this._started = false;
        this.metricService.destroyAll();
    }
    /** -----------------------------------------
     * Private Methods
     * ------------------------------------------
     */
    /**
     * Check if metric is historic or not
     *
     * @param historic
     * @returns {boolean}
     * @private
     */
    _historicEnabled(historic) {
        if (historic === false) {
            return false;
        }
        if (typeof (historic) === 'undefined') {
            return true;
        }
        return true;
    }
    /**
     * Only for tests
     *
     * @returns {Object}
     */
    _getVar() {
        return this._var;
    }
    /**
     * Data that will be sent to Keymetrics
     */
    _cookData(data) {
        const cookedData = {};
        const self = this;
        data.forEach(function (probe, probeName) {
            if (typeof (data.get(probeName).value) === 'undefined') {
                return false;
            }
            const value = self._getValue(data.get(probeName).value);
            // do not send data if this is always equal to 0
            // probably an initialized metric which is not "active"
            if ((self._alreadySentData.indexOf(probeName) === -1 && value !== 0) ||
                self._alreadySentData.indexOf(probeName) > -1) {
                if (self._alreadySentData.indexOf(probeName) === -1) {
                    self._alreadySentData.push(probeName);
                }
                cookedData[probeName] = {
                    value: value
                };
                /**
                 * Attach aggregation mode
                 */
                if (data.get(probeName).agg_type &&
                    data.get(probeName).agg_type !== 'none') {
                    cookedData[probeName].agg_type = data.get(probeName).agg_type;
                }
                cookedData[probeName].historic = data.get(probeName).historic;
                cookedData[probeName].type = data.get(probeName).type;
                cookedData[probeName].unit = data.get(probeName).unit;
            }
        });
        return cookedData;
    }
    _getValue(value) {
        if (typeof (value) === 'function') {
            return value();
        }
        return value;
    }
}
exports.default = MetricsFeature;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9mZWF0dXJlcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0RBQTBDO0FBQzFDLHNEQUE4QztBQUM5QywwREFBa0Q7QUFDbEQsc0RBQWtEO0FBQ2xELGtEQUEwQztBQUMxQyw0Q0FBb0M7QUFDcEMsaURBQWdEO0FBRWhEO0lBdUJFO1FBdEJRLFNBQUksR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNsQyx1QkFBa0IsR0FBVyxLQUFLLENBQUE7UUFDbEMsYUFBUSxHQUFZLEtBQUssQ0FBQTtRQUN6QixxQkFBZ0IsR0FBa0IsRUFBRSxDQUFBO1FBSXBDLDJCQUFzQixHQUFrQjtZQUM5QyxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxPQUFPO1lBQ1AsVUFBVTtZQUNWLE1BQU07WUFDTixRQUFRO1lBQ1IsUUFBUTtZQUNSLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLE1BQU07U0FDUCxDQUFBO1FBR0MsSUFBSSxDQUFDLElBQUksR0FBRywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUM1QywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxpQkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDN0QsSUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUMxRCxDQUFDO0lBRUQsSUFBSSxDQUFFLE1BQU8sRUFBRSxLQUFNO1FBQ25CLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUU7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7WUFDcEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFBO1lBRWpCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO2dCQUN2QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUUzQyx3QkFBd0I7Z0JBQ3hCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNsQyxtQkFBUyxDQUFDLElBQUksQ0FBQzt3QkFDYixJQUFJLEVBQUUsYUFBYTt3QkFDbkIsSUFBSSxFQUFFLElBQUk7cUJBQ1gsQ0FBQyxDQUFBO2lCQUNIO1lBQ0gsQ0FBQyxFQUFFLG1CQUFTLENBQUMsZUFBZSxDQUFDLENBQUE7WUFFN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQTtTQUNuQjtRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUV0QyxPQUFPO1lBQ0wsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1NBQ3BCLENBQUE7SUFDSCxDQUFDO0lBRUQsU0FBUyxDQUFFLFlBQVksRUFBRSxRQUFTO1FBQ2hDLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFO1lBQ3BDLFFBQVEsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFBO1lBQzVCLFlBQVksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFBO1NBQ2pDO1FBRUQsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7WUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFBO1lBQy9ELE9BQU8sU0FBUyxDQUFBO1NBQ2pCO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO1lBQzFCLEtBQUssRUFBRSxRQUFRO1NBQ2hCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxLQUFLLENBQUUsSUFBUztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBO1lBQ2pELE9BQU8sU0FBUyxDQUFBO1NBQ2pCO1FBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtRQUUzQixNQUFNLEtBQUssR0FBRyxJQUFJLGVBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUU3QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLEtBQUssRUFBRTtnQkFDTCxPQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUNyQyxDQUFDO1lBQ0QsSUFBSSxFQUFNLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUk7WUFDaEMsUUFBUSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzlDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxrQkFBa0I7WUFDbEQsSUFBSSxFQUFHLElBQUksQ0FBQyxJQUFJO1NBQ2pCLENBQUMsQ0FBQTtRQUVGLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVELE9BQU8sQ0FBRSxJQUFVO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO1lBQ25ELE9BQU8sU0FBUyxDQUFBO1NBQ2pCO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRWpDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDdkIsS0FBSyxFQUFFLGNBQWMsT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUEsQ0FBQyxDQUFDO1lBQzNDLElBQUksRUFBTSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJO1lBQ2hDLFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5QyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsa0JBQWtCO1lBQ2xELElBQUksRUFBRyxJQUFJLENBQUMsSUFBSTtTQUNqQixDQUFDLENBQUE7UUFFRixPQUFPLE9BQU8sQ0FBQTtJQUNoQixDQUFDO0lBRUQsU0FBUyxDQUFFLElBQVU7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUE7WUFDckQsT0FBTyxTQUFTLENBQUE7U0FDakI7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFBO1FBQzdDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUE7UUFFM0IsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNoRSxPQUFPLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUN0RixPQUFPLFNBQVMsQ0FBQTtTQUNqQjtRQUVELE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUVyQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLEtBQUssRUFBRTtnQkFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDbkUsQ0FBQztZQUNELElBQUksRUFBTSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJO1lBQ2hDLFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5QyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsa0JBQWtCO1lBQ2xELElBQUksRUFBRyxJQUFJLENBQUMsSUFBSTtTQUNqQixDQUFDLENBQUE7UUFFRixPQUFPLFNBQVMsQ0FBQTtJQUNsQixDQUFDO0lBRUQsTUFBTSxDQUFFLElBQUk7UUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtZQUNsRCxPQUFPLFNBQVMsQ0FBQTtTQUNqQjtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDdkIsS0FBSyxFQUFLLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQztZQUN6QixJQUFJLEVBQU0sSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSTtZQUNoQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDOUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQjtZQUNsRCxJQUFJLEVBQUcsSUFBSSxDQUFDLElBQUk7U0FDakIsQ0FBQyxDQUFBO1FBRUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBRWpCLE9BQU87WUFDTCxHQUFHLEVBQUc7Z0JBQ0osSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQTtnQkFFMUMsSUFBSSxPQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssVUFBVSxFQUFFO29CQUNoQyxLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUE7aUJBQ2hCO2dCQUVELE9BQU8sS0FBSyxDQUFBO1lBQ2QsQ0FBQztZQUNELEdBQUcsRUFBRyxVQUFVLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO1lBQ3JDLENBQUM7U0FDRixDQUFBO0lBQ0gsQ0FBQztJQUVELFlBQVksQ0FBRSxJQUFZO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN0RSxDQUFDO0lBRUQsT0FBTztRQUNMLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDekIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO1FBRXJCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUE7SUFDakMsQ0FBQztJQUNEOzs7T0FHRztJQUVIOzs7Ozs7T0FNRztJQUNILGdCQUFnQixDQUFFLFFBQVE7UUFDeEIsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO1lBQ3RCLE9BQU8sS0FBSyxDQUFBO1NBQ2I7UUFDRCxJQUFJLE9BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxXQUFXLEVBQUU7WUFDcEMsT0FBTyxJQUFJLENBQUE7U0FDWjtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsQ0FBRSxJQUFJO1FBQ2IsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFBO1FBQ3JCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQTtRQUVqQixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLFNBQVM7WUFFckMsSUFBSSxPQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxXQUFXLEVBQUU7Z0JBQ3JELE9BQU8sS0FBSyxDQUFBO2FBQ2I7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7WUFFdkQsZ0RBQWdEO1lBQ2hELHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUMvQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ25ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7aUJBQ3RDO2dCQUVELFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRztvQkFDdEIsS0FBSyxFQUFFLEtBQUs7aUJBQ2IsQ0FBQTtnQkFFRDs7bUJBRUc7Z0JBQ0gsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVE7b0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtvQkFDekMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtpQkFDOUQ7Z0JBRUQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtnQkFDN0QsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQTtnQkFFckQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQTthQUN0RDtRQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxVQUFVLENBQUE7SUFDbkIsQ0FBQztJQUVELFNBQVMsQ0FBRSxLQUFLO1FBQ2QsSUFBSSxPQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssVUFBVSxFQUFFO1lBQ2hDLE9BQU8sS0FBSyxFQUFFLENBQUE7U0FDZjtRQUNELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztDQUNGO0FBL1FELGlDQStRQyJ9