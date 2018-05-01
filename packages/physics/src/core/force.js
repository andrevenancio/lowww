import { types } from '../constants';

class Force {
    constructor() {
        this.type = types.FORCE;
    }

    remove() {
        this.to_remove = true;
    }
}

export default Force;
