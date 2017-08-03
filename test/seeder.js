const Gun = require('gun');

class Seeder {
    constructor(opt, data) {
        this.opt = opt;
        this.data = data;

        return this;
    }

    run(done) {
        this.gun = new Gun(this.opt);

        this.seed(done);
    }

    seed(done) {
        if (!this.data) {
            throw "Seed data must be passed in either the constructor or into the seed method directly.";
        }

        const keys = Object.keys(this.data);
        let target = keys.length;
        let ackCount = 0;
        keys.forEach(key => {
            this.gun.get(key).put(this.data[key], ack => {
                if (ack.error) {
                    throw ack.error;
                }

                ackCount++;
                if (ackCount === target) {
                    done();
                }
            });
        });
    }
}

module.exports = Seeder;