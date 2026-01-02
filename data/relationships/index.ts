
import { HOSTILE_LOG_EVENTS } from './hostile/events';
import { HOSTILE_HOUSING_ACTIONS } from './hostile/actions';
import { FRIENDLY_LOG_EVENTS } from './friendly/events';
import { FRIENDLY_HOUSING_ACTIONS } from './friendly/actions';
import { ROMANTIC_LOG_EVENTS } from './romantic/events';
import { ROMANTIC_HOUSING_ACTIONS } from './romantic/actions';
import { PROFESSIONAL_LOG_EVENTS } from './professional/events';
import { PROFESSIONAL_HOUSING_ACTIONS } from './professional/actions';
import { FAMILY_LOG_EVENTS } from './family/events';
import { FAMILY_HOUSING_ACTIONS } from './family/actions';

export const COMBINED_RELATIONSHIP_EVENTS = {
  ...HOSTILE_LOG_EVENTS,
  ...FRIENDLY_LOG_EVENTS,
  ...ROMANTIC_LOG_EVENTS,
  ...PROFESSIONAL_LOG_EVENTS,
  ...FAMILY_LOG_EVENTS
};

export const COMBINED_RELATIONSHIP_ACTIONS = {
  ...HOSTILE_HOUSING_ACTIONS,
  ...FRIENDLY_HOUSING_ACTIONS,
  ...ROMANTIC_HOUSING_ACTIONS,
  ...PROFESSIONAL_HOUSING_ACTIONS,
  ...FAMILY_HOUSING_ACTIONS
};
