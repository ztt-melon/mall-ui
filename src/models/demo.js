import {add} from '../services/demo'

export default {
    namespace: 'demo',
    state: {},
    effects: {
        * add({payload}, {call}) {
            const response = yield call(add, payload);
            console.log("response",response)
        }
    }
}