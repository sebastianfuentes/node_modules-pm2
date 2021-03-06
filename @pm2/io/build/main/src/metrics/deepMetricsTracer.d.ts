import MetricsFeature from '../features/metrics';
export default class DeepMetricsTracer {
    private metricFeature;
    private tracer;
    private eventName;
    private listenerFunc;
    private allMetrics;
    constructor(metricFeature: MetricsFeature, tracer: any, eventName: any);
    init(): void;
    destroy(): void;
    listener(data: any): void;
}
