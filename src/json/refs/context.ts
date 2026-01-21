import type {JSONObject} from 'src/json';

export class WalkerContext {
    readonly ancestors: JSONObject[] = [];

    location: string;

    constructor(location?: string, ancestors?: WalkerContext['ancestors']) {
        this.location = location || '';
        this.ancestors = (ancestors || []).slice();
    }

    shouldVisit(value: JSONObject) {
        if (this.ancestors.includes(value)) {
            return false;
        }

        this.ancestors.push(value);

        return true;
    }

    copy() {
        return new WalkerContext(this.location, this.ancestors);
    }
}
