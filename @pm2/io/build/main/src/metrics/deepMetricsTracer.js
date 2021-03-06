"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeepMetricsTracer {
    constructor(metricFeature, tracer, eventName) {
        this.allMetrics = {
            http: {
                histogram: {
                    name: 'HTTP: Response time',
                    type: 'http/inbound/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'HTTP: Throughput',
                    samples: 60,
                    type: 'http/inbound/throughput',
                    unit: 'req/min'
                }
            },
            https: {
                histogram: {
                    name: 'HTTPS: Response time',
                    type: 'https/inbound/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'HTTPS: Throughput',
                    samples: 60,
                    type: 'https/inbound/throughput',
                    unit: 'req/min'
                }
            },
            'http-outbound': {
                histogram: {
                    name: 'HTTP out: Response time',
                    type: 'http/outbound/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'HTTP out: Throughput',
                    samples: 60,
                    type: 'http/outbound/throughput',
                    unit: 'req/min'
                }
            },
            'https-outbound': {
                histogram: {
                    name: 'HTTPS out: Response time',
                    type: 'https/outbound/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'HTTPS out: Throughput',
                    samples: 60,
                    type: 'https/outbound/throughput',
                    unit: 'req/min'
                }
            },
            mysql: {
                histogram: {
                    name: 'MYSQL: Response time',
                    type: 'mysql/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'MYSQL: Throughput',
                    samples: 60,
                    type: 'mysql/throughput',
                    unit: 'req/min'
                }
            },
            mongo: {
                histogram: {
                    name: 'Mongo: Response time',
                    type: 'mongodb/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'Mongo: Throughput',
                    samples: 60,
                    type: 'mongodb/throughput',
                    unit: 'req/min'
                }
            },
            mqtt: {
                histogram: {
                    name: 'MQTT: Response time',
                    type: 'mqtt/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'MQTT: Throughput',
                    samples: 60,
                    type: 'mqtt/throughput',
                    unit: 'req/min'
                }
            },
            socketio: {
                histogram: {
                    name: 'WS: Response time',
                    type: 'socketio/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'WS: Throughput',
                    samples: 60,
                    type: 'socketio/throughput',
                    unit: 'req/min'
                }
            },
            redis: {
                histogram: {
                    name: 'Redis: Response time',
                    type: 'redis/latency',
                    measurement: 'mean',
                    unit: 'ms'
                },
                meter: {
                    name: 'Redis: Throughput',
                    samples: 60,
                    type: 'redis/throughput',
                    unit: 'req/min'
                }
            }
        };
        this.metricFeature = metricFeature;
        this.tracer = tracer;
        this.eventName = eventName;
        this.listenerFunc = this.listener.bind(this);
    }
    init() {
        this.tracer.on(this.eventName, this.listenerFunc);
    }
    destroy() {
        this.tracer.removeListener(this.eventName, this.listenerFunc);
    }
    listener(data) {
        let latency;
        let throughput;
        if (!latency) {
            latency = this.metricFeature.histogram(this.allMetrics[this.eventName].histogram);
        }
        if (!throughput) {
            throughput = this.metricFeature.meter(this.allMetrics[this.eventName].meter);
        }
        data = JSON.parse(data);
        throughput.mark();
        if (data.duration) {
            latency.update(data.duration);
        }
    }
}
exports.default = DeepMetricsTracer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVlcE1ldHJpY3NUcmFjZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWV0cmljcy9kZWVwTWV0cmljc1RyYWNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0lBdUlFLFlBQWEsYUFBNkIsRUFBRSxNQUFNLEVBQUUsU0FBUztRQWpJckQsZUFBVSxHQUFHO1lBQ25CLElBQUksRUFBRTtnQkFDSixTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLHFCQUFxQjtvQkFDM0IsSUFBSSxFQUFFLHNCQUFzQjtvQkFDNUIsV0FBVyxFQUFFLE1BQU07b0JBQ25CLElBQUksRUFBRSxJQUFJO2lCQUNYO2dCQUNELEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsa0JBQWtCO29CQUN4QixPQUFPLEVBQUUsRUFBRTtvQkFDWCxJQUFJLEVBQUUseUJBQXlCO29CQUMvQixJQUFJLEVBQUUsU0FBUztpQkFDaEI7YUFDRjtZQUNELEtBQUssRUFBRTtnQkFDTCxTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLHNCQUFzQjtvQkFDNUIsSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsV0FBVyxFQUFFLE1BQU07b0JBQ25CLElBQUksRUFBRSxJQUFJO2lCQUNYO2dCQUNELEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsbUJBQW1CO29CQUN6QixPQUFPLEVBQUUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsMEJBQTBCO29CQUNoQyxJQUFJLEVBQUUsU0FBUztpQkFDaEI7YUFDRjtZQUNELGVBQWUsRUFBRTtnQkFDZixTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLHlCQUF5QjtvQkFDL0IsSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsV0FBVyxFQUFFLE1BQU07b0JBQ25CLElBQUksRUFBRSxJQUFJO2lCQUNYO2dCQUNELEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsc0JBQXNCO29CQUM1QixPQUFPLEVBQUUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsMEJBQTBCO29CQUNoQyxJQUFJLEVBQUUsU0FBUztpQkFDaEI7YUFDRjtZQUNELGdCQUFnQixFQUFFO2dCQUNoQixTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLDBCQUEwQjtvQkFDaEMsSUFBSSxFQUFFLHdCQUF3QjtvQkFDOUIsV0FBVyxFQUFFLE1BQU07b0JBQ25CLElBQUksRUFBRSxJQUFJO2lCQUNYO2dCQUNELEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixPQUFPLEVBQUUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsMkJBQTJCO29CQUNqQyxJQUFJLEVBQUUsU0FBUztpQkFDaEI7YUFDRjtZQUNELEtBQUssRUFBRTtnQkFDTCxTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLHNCQUFzQjtvQkFDNUIsSUFBSSxFQUFFLGVBQWU7b0JBQ3JCLFdBQVcsRUFBRSxNQUFNO29CQUNuQixJQUFJLEVBQUUsSUFBSTtpQkFDWDtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLG1CQUFtQjtvQkFDekIsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLGtCQUFrQjtvQkFDeEIsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCO2FBQ0Y7WUFDRCxLQUFLLEVBQUU7Z0JBQ0wsU0FBUyxFQUFFO29CQUNULElBQUksRUFBRSxzQkFBc0I7b0JBQzVCLElBQUksRUFBRSxpQkFBaUI7b0JBQ3ZCLFdBQVcsRUFBRSxNQUFNO29CQUNuQixJQUFJLEVBQUUsSUFBSTtpQkFDWDtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLG1CQUFtQjtvQkFDekIsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLG9CQUFvQjtvQkFDMUIsSUFBSSxFQUFFLFNBQVM7aUJBQ2hCO2FBQ0Y7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osU0FBUyxFQUFFO29CQUNULElBQUksRUFBRSxxQkFBcUI7b0JBQzNCLElBQUksRUFBRSxjQUFjO29CQUNwQixXQUFXLEVBQUUsTUFBTTtvQkFDbkIsSUFBSSxFQUFFLElBQUk7aUJBQ1g7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLElBQUksRUFBRSxrQkFBa0I7b0JBQ3hCLE9BQU8sRUFBRSxFQUFFO29CQUNYLElBQUksRUFBRSxpQkFBaUI7b0JBQ3ZCLElBQUksRUFBRSxTQUFTO2lCQUNoQjthQUNGO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLFNBQVMsRUFBRTtvQkFDVCxJQUFJLEVBQUUsbUJBQW1CO29CQUN6QixJQUFJLEVBQUUsa0JBQWtCO29CQUN4QixXQUFXLEVBQUUsTUFBTTtvQkFDbkIsSUFBSSxFQUFFLElBQUk7aUJBQ1g7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLElBQUksRUFBRSxnQkFBZ0I7b0JBQ3RCLE9BQU8sRUFBRSxFQUFFO29CQUNYLElBQUksRUFBRSxxQkFBcUI7b0JBQzNCLElBQUksRUFBRSxTQUFTO2lCQUNoQjthQUNGO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLFNBQVMsRUFBRTtvQkFDVCxJQUFJLEVBQUUsc0JBQXNCO29CQUM1QixJQUFJLEVBQUUsZUFBZTtvQkFDckIsV0FBVyxFQUFFLE1BQU07b0JBQ25CLElBQUksRUFBRSxJQUFJO2lCQUNYO2dCQUNELEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsbUJBQW1CO29CQUN6QixPQUFPLEVBQUUsRUFBRTtvQkFDWCxJQUFJLEVBQUUsa0JBQWtCO29CQUN4QixJQUFJLEVBQUUsU0FBUztpQkFDaEI7YUFDRjtTQUNGLENBQUE7UUFHQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtRQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBRUQsUUFBUSxDQUFFLElBQUk7UUFDWixJQUFJLE9BQU8sQ0FBQTtRQUNYLElBQUksVUFBVSxDQUFBO1FBRWQsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUNsRjtRQUVELElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDZixVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7U0FDN0U7UUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN2QixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDakIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQzlCO0lBQ0gsQ0FBQztDQUNGO0FBeEtELG9DQXdLQyJ9