// holds your root state
export const state = () => ({
    locationData: {},
    locationData: {},
    navigator: {},
    disableCheckInButton: false,
    disableCheckOutButton: true,
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
    disableCheckInButton(state, value) {
        state.disableCheckInButton = value;
    },
    disableCheckOutButton(state, value) {
        state.disableCheckOutButton = value;
    },
};
