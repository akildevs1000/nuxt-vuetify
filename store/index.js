// holds your root state
export const state = () => ({
    locationData: {},
    locationData: {},
    navigator: {},

});

// contains your mutations
export const mutations = {
    locationData(state, value) {
        state.locationData = value;
    },
    locationError(state, value) {
        state.locationError = value;
    },
    navigator(state, value) {
        state.navigator = value;
    },
};
