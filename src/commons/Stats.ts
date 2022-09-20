/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Stats from 'stats.js';

// class Stats {
//     constructor() {
//         this.stats = new StatsJS();
//         this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//         document.body.appendChild(this.stats.dom);
//     }

//     static getStats() {
//         return Stats.getInstance().stats;
//     }

//     static getInstance() {
//         if (!Stats.instance) {
//             Stats.instance = new Stats();
//         }
//         return Stats.instance;
//     }
// }
// interface StatsI {
//     begin: () => void;
//     end: () => void;
// }
// class SuperStats implements StatsI {
//     begin() {}

//     end() {}
// }
// const stat: Stats = new Stats();
// declare const StatsTS: StatsJS;

// let stats: Stats;
// const StatsSingle = {
//     getStats: (): Stats => {
//         if (!stats) {
//             stats = new Stats();
//             stats.showPanel(0);
//             document.body.appendChild(stats.dom);
//         }
//         return stats;
//     },
// };
// export default StatsSingle;


// const StatsSingle = {
//     getStats: (): Stats => {
//         if (!stats) {
//             stats = new Stats();
//             stats.showPanel(0);
//             document.body.appendChild(stats.dom);
//         }
//         return stats;
//     },
// };
class StatsSingle extends Stats {
    constructor() {
        super();
        this.showPanel(0);
        document.body.appendChild(this.dom);
    }

    begin(): void {
        super.begin();
    }

    override end(): number {
        return super.end() as number;
    }
}
export default StatsSingle;


// const object = {
//     m: new SuperStats(),
// };
