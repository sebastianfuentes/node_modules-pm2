"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_1 = require("debug");
const debug = debug_1.default('axm:profilingaction');
const profiling_1 = require("../features/profiling");
const miscellaneous_1 = require("../utils/miscellaneous");
const file_1 = require("../utils/file");
const transport_1 = require("../utils/transport");
class ProfilingCPUAction {
    constructor(actionFeature) {
        this.actionFeature = actionFeature;
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.profilingFeature = new profiling_1.default();
            this.profilings = this.profilingFeature.init();
            try {
                yield this.profilings.cpuProfiling.init();
                // expose actions only if the feature is available
                this.exposeActions();
            }
            catch (err) {
                debug(`Failed to load cpu profiler: ${err.message}`);
            }
        });
    }
    destroy() {
        if (this.profilingFeature)
            this.profilingFeature.destroy();
    }
    stopProfiling(reply) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const dumpFile = yield this.profilings.cpuProfiling.stop();
                let size;
                try {
                    size = yield file_1.default.getFileSize(dumpFile);
                }
                catch (err) {
                    size = -1;
                }
                return reply({
                    success: true,
                    cpuprofile: true,
                    dump_file: dumpFile,
                    dump_file_size: size,
                    uuid: this.uuid
                });
            }
            catch (err) {
                return reply({
                    success: false,
                    err: err,
                    uuid: this.uuid
                });
            }
        });
    }
    exposeActions() {
        this.actionFeature.action('km:cpu:profiling:start', (opts, reply) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!reply) {
                reply = opts;
                opts = null;
            }
            try {
                this.uuid = miscellaneous_1.default.generateUUID();
                yield this.profilings.cpuProfiling.start();
                reply({ success: true, uuid: this.uuid });
                if (opts.timeout && typeof opts.timeout === 'number') {
                    setTimeout((_) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const reply = (data) => transport_1.default.send({
                            type: 'axm:reply',
                            data: {
                                return: data,
                                action_name: 'km:cpu:profiling:stop'
                            }
                        });
                        yield this.stopProfiling(reply);
                    }), opts.timeout);
                }
            }
            catch (err) {
                return reply({
                    success: false,
                    err: err,
                    uuid: this.uuid
                });
            }
        }));
        this.actionFeature.action('km:cpu:profiling:stop', this.stopProfiling.bind(this));
    }
}
exports.default = ProfilingCPUAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsaW5nQ3B1LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FjdGlvbnMvcHJvZmlsaW5nQ3B1LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUF5QjtBQUN6QixNQUFNLEtBQUssR0FBRyxlQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUcxQyxxREFBb0Q7QUFFcEQsMERBQThDO0FBQzlDLHdDQUFxQztBQUNyQyxrREFBMEM7QUFFMUM7SUFPRSxZQUFhLGFBQTZCO1FBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0lBQ3BDLENBQUM7SUFFSyxJQUFJOztZQUNSLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFnQixFQUFFLENBQUE7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDOUMsSUFBSTtnQkFDRixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFBO2dCQUN6QyxrREFBa0Q7Z0JBQ2xELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTthQUNyQjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEtBQUssQ0FBQyxnQ0FBZ0MsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7YUFDckQ7UUFDSCxDQUFDO0tBQUE7SUFFRCxPQUFPO1FBQ0wsSUFBSSxJQUFJLENBQUMsZ0JBQWdCO1lBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzVELENBQUM7SUFFYSxhQUFhLENBQUUsS0FBSzs7WUFDaEMsSUFBSTtnQkFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFBO2dCQUUxRCxJQUFJLElBQUksQ0FBQTtnQkFDUixJQUFJO29CQUNGLElBQUksR0FBRyxNQUFNLGNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7aUJBQzdDO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNaLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQTtpQkFDVjtnQkFFRCxPQUFPLEtBQUssQ0FBQztvQkFDWCxPQUFPLEVBQU8sSUFBSTtvQkFDbEIsVUFBVSxFQUFJLElBQUk7b0JBQ2xCLFNBQVMsRUFBSyxRQUFRO29CQUN0QixjQUFjLEVBQUcsSUFBSTtvQkFDckIsSUFBSSxFQUFVLElBQUksQ0FBQyxJQUFJO2lCQUN4QixDQUFDLENBQUE7YUFDSDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLE9BQU8sS0FBSyxDQUFDO29CQUNYLE9BQU8sRUFBRyxLQUFLO29CQUNmLEdBQUcsRUFBTyxHQUFHO29CQUNiLElBQUksRUFBTSxJQUFJLENBQUMsSUFBSTtpQkFDcEIsQ0FBQyxDQUFBO2FBQ0g7UUFDSCxDQUFDO0tBQUE7SUFFTyxhQUFhO1FBRW5CLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQU8sSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3hFLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1YsS0FBSyxHQUFHLElBQUksQ0FBQTtnQkFDWixJQUFJLEdBQUcsSUFBSSxDQUFBO2FBQ1o7WUFFRCxJQUFJO2dCQUNGLElBQUksQ0FBQyxJQUFJLEdBQUcsdUJBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtnQkFDcEMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtnQkFDMUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFHLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7Z0JBRTFDLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO29CQUNwRCxVQUFVLENBQUMsQ0FBTSxDQUFDLEVBQUMsRUFBRTt3QkFDbkIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLG1CQUFTLENBQUMsSUFBSSxDQUFDOzRCQUNyQyxJQUFJLEVBQVUsV0FBVzs0QkFDekIsSUFBSSxFQUFVO2dDQUNaLE1BQU0sRUFBUSxJQUFJO2dDQUNsQixXQUFXLEVBQUcsdUJBQXVCOzZCQUN0Qzt5QkFDRixDQUFDLENBQUE7d0JBQ0YsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO29CQUNqQyxDQUFDLENBQUEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7aUJBQ2pCO2FBQ0Y7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixPQUFPLEtBQUssQ0FBQztvQkFDWCxPQUFPLEVBQUcsS0FBSztvQkFDZixHQUFHLEVBQU8sR0FBRztvQkFDYixJQUFJLEVBQU0sSUFBSSxDQUFDLElBQUk7aUJBQ3BCLENBQUMsQ0FBQTthQUNIO1FBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDbkYsQ0FBQztDQUNGO0FBMUZELHFDQTBGQyJ9