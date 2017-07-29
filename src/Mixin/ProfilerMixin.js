import BaseMixin from './base-mixin';

export default class ProfilerMixin extends BaseMixin {

    constructor(context) {
        super(context, [
            'opt',
            'afterRead',
            'afterWrite',
            '__readAggregate',
            '__writeAggregate',
            '__readCount',
            '__readErrCount',
            '__writeCount',
            '__writeErrCount',
            '__readInterval',
            '__writeInterval',
            '__log'
        ]);

        context.__readAggregate = [];
        context.__writeAggregate = [];
        context.__readCount = 0;
        context.__readErrCount = 0;
        context.__writeErrCount = 0;
        context.__writeCount = 0;
        context.__readInterval = null;
        context.__writeInterval = null;
    }

    __log(message) {
        console.info(`Profiler: ${message}`);
    }

    /**
     * 
     */
    opt(context, next) {
        console.warn('You are using the Gun-Flint profiler mixin. This is intended to profile your adapter during development and should not be deployed into production environments.');

        // Update every minute
        setInterval(() => {
            let avgReads = this.__readAggregate.reduce((carry, val) => {
                return carry + val;
            }, 0);
            this.__readAggregate = [];
            this.__log(`GET AVG: ${avgReads} total gets in last minute; ${avgReads/60} reads/sec; .`);

            let avgWrites = this.__writeAggregate.reduce((carry, val) => {
                return carry + val;
            }, 0);
            this.__writeAggregate = [];
            this.__log(`PUT AVG: ${avgWrites} total gets in last minute; ${avgWrites/60} reads/sec.`);
        }, 60 * 1000);

        // Update every second
        this.__readInterval = setInterval(() => {
            if (this.__readCount) {
                let reads = this.__readCount;
                let readErr = this.__readErrCount;
                this.__readCount = 0;
                this.__readErrCount = 0;
                this.__log(`GET: ${writes} reads/sec; ${reads / 10000} ms/read; ${readErr} errs/sec.`);
                this.__readAggregate.push(reads);
            } else {
                this.__log(`GET: no reads in last 10 sec`);
            }
        }, 10000);

        // Update every second
        this.__writeInterval = setInterval(() => {
            if (this.__writeCount) {
                let writes = this.__writeCount;
                let writeErr = this.__writeErrCount;
                this.__writeCount = 0;
                this.__writeErrCount = 0;
                this.__log(`PUT: ${writes/10} writes/sec; ${writes / 10000} ms/write; ${writeErr} errs/sec.`);
                this.__writeAggregate.push(writes);
            } else {
                this.__log(`PUT: no writes in last 10 sec`);
            }
        }, 10000);

        next(context);
    }

    afterRead(dedupId, err, data, next) {
        if (!data) {
            next = data;
        }
        if (!err) {
            this.__readCount++;
        } else {
            this.__readErrCount++;
        }
        next(dedupId, err, data);
    }

    afterWrite(dedupId, err, next) {
        if (!next) {
            next = err;
            err = null;
        }

        if (!err) {
            this.__writeCount++;
        } else {
            this.__writeErrCount++;
        }
        next(dedupId, err);
    }
}