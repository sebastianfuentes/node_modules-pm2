"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("debug");
const debug = debug_1.default('axm:eventLoop');
class EventLoopHandlesRequestsMetric {
    constructor(metricFeature) {
        this.metricFeature = metricFeature;
    }
    init(config) {
        if (typeof this.getProcess()._getActiveRequests === 'function') {
            this.metricFeature.metric({
                name: 'Active requests',
                value: () => { return this.getProcess()._getActiveRequests().length; }
            });
        }
        if (typeof this.getProcess()._getActiveHandles === 'function') {
            this.metricFeature.metric({
                name: 'Active handles',
                value: () => { return this.getProcess()._getActiveHandles().length; }
            });
        }
    }
    destroy() {
        debug('EventLoopHandlesRequestsMetric destroyed !');
    }
    getProcess() {
        return process;
    }
}
exports.default = EventLoopHandlesRequestsMetric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRMb29wSGFuZGxlc1JlcXVlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL21ldHJpY3MvZXZlbnRMb29wSGFuZGxlc1JlcXVlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsaUNBQXlCO0FBQ3pCLE1BQU0sS0FBSyxHQUFHLGVBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUVwQztJQUdFLFlBQWEsYUFBNkI7UUFDeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7SUFDcEMsQ0FBQztJQUVELElBQUksQ0FBRSxNQUFzQjtRQUMxQixJQUFJLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLGtCQUFrQixLQUFLLFVBQVUsRUFBRTtZQUM5RCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDeEIsSUFBSSxFQUFHLGlCQUFpQjtnQkFDeEIsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxDQUFBLENBQUMsQ0FBQzthQUN0RSxDQUFDLENBQUE7U0FDSDtRQUVELElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFO1lBQzdELElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO2dCQUN4QixJQUFJLEVBQUcsZ0JBQWdCO2dCQUN2QixLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxNQUFNLENBQUEsQ0FBQyxDQUFDO2FBQ3JFLENBQUMsQ0FBQTtTQUNIO0lBQ0gsQ0FBQztJQUVELE9BQU87UUFDTCxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRU8sVUFBVTtRQUNoQixPQUFPLE9BQU8sQ0FBQTtJQUNoQixDQUFDO0NBQ0Y7QUE5QkQsaURBOEJDIn0=