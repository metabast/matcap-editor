import Stats from 'stats.js';

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
        return super.end();
    }
}
export default StatsSingle;
