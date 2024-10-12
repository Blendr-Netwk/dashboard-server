"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceScheduler = void 0;
const node_1 = require("../prisma/node");
const emmiter_1 = require("../socketio/emmiter");
const user_1 = require("../prisma/user");
class InstanceScheduler {
    interval = 1000 * 60 * 30; // 30 minutes
    timer = null;
    constructor() {
        // this.interval = interval;
    }
    start() {
        if (this.timer) {
            console.log('Scheduler is already running.');
            return;
        }
        console.log('Starting scheduler...');
        this.timer = setInterval(() => this.checkInstances(), this.interval);
    }
    stop() {
        if (!this.timer) {
            console.log('Scheduler is not running.');
            return;
        }
        console.log('Stopping scheduler...');
        clearInterval(this.timer);
        this.timer = null;
    }
    async checkInstances() {
        try {
            const currentTime = new Date();
            // const instance = await fetchRunningInstances()
            // instance.map(async (instance: any) => {
            //     if (currentTime > instance.expireAt) {
            //         //await terminateAwsInstance(instance)
            //     }
            // })
            const nodes = await (0, node_1.fetchAllRentedNodes)();
            nodes.map(async (node) => {
                if (currentTime > node.expireAt) {
                    await (0, emmiter_1.emitRevokeLendNode)(node.socketId, { username: node.rentedById });
                    const differenceInMilliseconds = node.expireAt.getTime() - node.startedAt.getTime();
                    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                    const neededCredits = node.price * differenceInHours;
                    await (0, user_1.updateBalance)(node.ownerId, "ADD", neededCredits);
                    await (0, node_1.updateRemoveRentedNode)(node.id);
                    //await terminateAwsInstance(instance)
                }
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.InstanceScheduler = InstanceScheduler;
