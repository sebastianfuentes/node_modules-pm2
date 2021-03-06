"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const proxy_1 = require("../utils/proxy");
const httpWrapper_1 = require("../wrapper/httpWrapper");
const debug_1 = require("debug");
const debug = debug_1.default('axm:tracing');
const transport_1 = require("../utils/transport");
const configuration_1 = require("../configuration");
const metricConfig_1 = require("../utils/metricConfig");
const serviceManager_1 = require("../serviceManager");
class Transaction {
    constructor(metricFeature) {
        this.defaultConf = {
            http: true
        };
        this.metricFeature = metricFeature;
        serviceManager_1.ServiceManager.set('wrapper', {});
    }
    init(config) {
        config = metricConfig_1.default.getConfig(config, this.defaultConf);
        if (config.http) {
            const opts = typeof config.http === 'object' ? config.http : {};
            this.http(opts);
        }
        if (config.tracing) {
            const opts = typeof config.tracing === 'object' ? config.tracing : {};
            this.tracing(opts);
        }
    }
    destroy() {
        debug('Transaction destroyed !');
    }
    tracing(opts) {
        if (Array.isArray(opts.ignore_routes) && opts.ignore_routes.length > 0) {
            opts.ignoreFilter = { url: opts.ignore_routes };
        }
        // we should never enable tracing agent two time
        if (require('vxx').get().isActive())
            return;
        this.tracer = require('vxx').start(opts);
        configuration_1.default.configureModule({
            tracing_enabled: true
        });
        // broadcast to pm2 aggregator
        this.tracer.getBus().on('transaction', (data) => {
            transport_1.default.send({
                type: 'axm:trace',
                data: data
            });
        });
    }
    http(opts) {
        const Module = require('module');
        debug('Wrapping HTTP routes');
        if (Array.isArray(opts)) {
            const routes = JSON.parse(JSON.stringify(opts));
            opts = {
                http: true,
                http_latency: 200,
                http_code: 500,
                ignore_routes: routes
            };
        }
        opts = util['_extend']({
            http: true,
            http_latency: 200,
            http_code: 500,
            ignore_routes: []
        }, opts);
        const self = this;
        proxy_1.default.wrap(Module, '_load', (load) => {
            if (load.__axm_original) {
                debug('HTTP routes have already been wrapped before');
                configuration_1.default.configureModule({
                    latency: opts.http
                });
                if (opts.http === false) {
                    return function (file) {
                        return load.__axm_original.apply(this, arguments);
                    };
                }
                else {
                    return function (file) {
                        if (file === 'http' || file === 'https') {
                            return new httpWrapper_1.default(self.metricFeature).init(opts, load.__axm_original.apply(this, arguments));
                        }
                        else {
                            return load.__axm_original.apply(this, arguments);
                        }
                    };
                }
            }
            return function (file) {
                if (opts.http &&
                    (file === 'http' || file === 'https')) {
                    debug('http module being required');
                    configuration_1.default.configureModule({
                        latency: true
                    });
                    // initialize transaction metrics only once
                    if (!serviceManager_1.ServiceManager.get('wrapper')[file]) {
                        opts.name = file;
                        serviceManager_1.ServiceManager.get('wrapper')[file] = new httpWrapper_1.default(self.metricFeature).init(opts, load.apply(this, arguments));
                    }
                    return serviceManager_1.ServiceManager.get('wrapper')[file];
                }
                else {
                    return load.apply(this, arguments);
                }
            };
        });
    }
}
exports.default = Transaction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWV0cmljcy90cmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDZCQUE0QjtBQUM1QiwwQ0FBa0M7QUFDbEMsd0RBQW1EO0FBQ25ELGlDQUF5QjtBQUN6QixNQUFNLEtBQUssR0FBRyxlQUFLLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDbEMsa0RBQTBDO0FBQzFDLG9EQUE0QztBQUU1Qyx3REFBZ0Q7QUFDaEQsc0RBQWtEO0FBRWxEO0lBU0UsWUFBYSxhQUE2QjtRQUpsQyxnQkFBVyxHQUFHO1lBQ3BCLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQTtRQUdDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO1FBQ2xDLCtCQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNuQyxDQUFDO0lBRUQsSUFBSSxDQUFFLE1BQU87UUFDWCxNQUFNLEdBQUcsc0JBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUV6RCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDZixNQUFNLElBQUksR0FBRyxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7WUFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUNoQjtRQUVELElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNsQixNQUFNLElBQUksR0FBRyxPQUFPLE1BQU0sQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7WUFDckUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtT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