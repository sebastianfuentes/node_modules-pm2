export default class Meter {
    private _tickInterval;
    private _samples;
    private _timeframe;
    private _rate;
    private _interval;
    constructor(opts?: any);
    mark: (n: any) => void;
    val: () => number;
}
