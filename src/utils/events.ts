import {
  RemoveEventHandlerParams,
  Events,
  AddEventHandlerParams,
  FireEventHandlerParams,
  ClearEventHandlerParams,
  HasEventHandlerParams,
} from "../types/events";

const events: Events = {
  onError: {},
};

export function hasEventHandler({ target, key }: HasEventHandlerParams) {
  return events[target][key] !== undefined;
}

export function addEventHandler({
  target,
  key,
  handler,
}: AddEventHandlerParams) {
  events[target][key] = handler;
}

export function removeEventHandler({ target, key }: RemoveEventHandlerParams) {
  events[target][key] = undefined;
}

export function clearTargetEventHandlers({ target }: ClearEventHandlerParams) {
  events[target] = {};
}

export function fireEvent({ target, eventArgs }: FireEventHandlerParams) {
  const eventsToFire = Object.values(events[target]);
  eventsToFire.filter((x) => x !== undefined).forEach((x) => x!(eventArgs));
}
