"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EWMA_1 = require("../EWMA");
const units_1 = require("../units");
class Meter {
    constructor(opts) {
        this.mark = function (n) {
            n = n || 1;
            this._rate.update(n);
        };
        this.val = function () {
            return Math.round(this._rate.rate(this._samples * units_1.default.SECONDS) * 100) / 100;
        };
        const self = this;
        this._samples = opts.samples || opts.seconds || 1;
        this._timeframe = opts.timeframe || 60;
        this._tickInterval = opts.tickInterval || 5 * units_1.default.SECONDS;
        this._rate = new EWMA_1.default(this._timeframe * units_1.default.SECONDS, this._tickInterval);
        if (opts.debug && opts.debug === true) {
            return;
        }
        this._interval = setInterval(function () {
            self._rate.tick();
        }, this._tickInterval);
        this._interval.unref();
    }
}
exports.default = Meter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdXRpbHMvbWV0cmljcy9tZXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUEwQjtBQUMxQixvQ0FBNEI7QUFFNUI7SUFRRSxZQUFhLElBQVU7UUFvQnZCLFNBQUksR0FBRyxVQUFVLENBQUM7WUFDaEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7WUFFVixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN0QixDQUFDLENBQUE7UUFFRCxRQUFHLEdBQUc7WUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxlQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2hGLENBQUMsQ0FBQTtRQTNCQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUE7UUFFakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFBO1FBQ2pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUE7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsR0FBRyxlQUFLLENBQUMsT0FBTyxDQUFBO1FBRTNELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxlQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUUxRSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDckMsT0FBTTtTQUNQO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNuQixDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBRXRCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDeEIsQ0FBQztDQVdGO0FBckNELHdCQXFDQyJ9