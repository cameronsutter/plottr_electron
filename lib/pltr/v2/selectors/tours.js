import { createSelector } from 'reselect';

export const tourState = state => state.tour;

export const tourSelector = createSelector(
    tourState, tour => tour
);