"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_1 = require("debug");
const debug = debug_1.default('axm:profilingaction');
const profiling_1 = require("../features/profiling");
const miscellaneous_1 = require("../utils/miscellaneous");
const file_1 = require("../utils/file");
const transport_1 = require("../utils/transport");
class ProfilingHeapAction {
    constructor(actionFeature, config) {
        this.config = config;
        if (!config) {
            this.config = {};
        }
        this.actionFeature = actionFeature;
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.profilingFeature = new profiling_1.default();
            this.profilings = this.profilingFeature.init();
            try {
                yield this.profilings.heapProfiling.init(this.config.heap);
                this.exposeActions();
            }
            catch (err) {
                debug(`Failed to load heap profiler: ${err.message}`);
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
                const dumpFile = yield this.profilings.heapProfiling.stop();
                let size;
                try {
                    size = yield file_1.default.getFileSize(dumpFile);
                }
                catch (err) {
                    size = -1;
                }
                return reply({
                    success: true,
                    heapprofile: true,
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
        // -------------------------------------
        // Heap sampling
        // -------------------------------------
        this.actionFeature.action('km:heap:sampling:start', (opts, reply) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!reply) {
                reply = opts;
                opts = null;
            }
            try {
                this.uuid = miscellaneous_1.default.generateUUID();
                yield this.profilings.heapProfiling.start();
                reply({ success: true, uuid: this.uuid });
                if (opts.timeout && typeof opts.timeout === 'number') {
                    setTimeout((_) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const reply = (data) => transport_1.default.send({
                            type: 'axm:reply',
                            data: {
                                return: data,
                                action_name: 'km:heap:sampling:stop'
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
        this.actionFeature.action('km:heap:sampling:stop', this.stopProfiling.bind(this));
        // -------------------------------------
        // Heap dump
        // -------------------------------------
        this.actionFeature.action('km:heapdump', (reply) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const dumpFile = yield this.profilings.heapProfiling.takeSnapshot();
                return reply({
                    success: true,
                    heapdump: true,
                    dump_file: dumpFile
                });
            }
            catch (err) {
                return reply({
                    success: false,
                    err: err
                });
            }
        }));
    }
}
exports.default = ProfilingHeapAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsaW5nSGVhcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hY3Rpb25zL3Byb2ZpbGluZ0hlYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXlCO0FBQ3pCLE1BQU0sS0FBSyxHQUFHLGVBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBRzFDLHFEQUFvRDtBQUVwRCwwREFBOEM7QUFDOUMsd0NBQXFDO0FBQ3JDLGtEQUEwQztBQUUxQztJQVFFLFlBQWEsYUFBNkIsRUFBRSxNQUFPO1FBQ2pELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQTtTQUNqQjtRQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0lBQ3BDLENBQUM7SUFFSyxJQUFJOztZQUNSLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFnQixFQUFFLENBQUE7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDOUMsSUFBSTtnQkFDRixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUMxRCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7YUFDckI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixLQUFLLENBQUMsaUNBQWlDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2FBQ3REO1FBQ0gsQ0FBQztLQUFBO0lBRUQsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLGdCQUFnQjtZQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM1RCxDQUFDO0lBRWEsYUFBYSxDQUFFLEtBQUs7O1lBQ2hDLElB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