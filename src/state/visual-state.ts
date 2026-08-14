export type AirflowAxis = "still" | "horizontal" | "vertical" | "dual";

export const getAirflowAxis = (horizontal: boolean | undefined, vertical: boolean | undefined): AirflowAxis => {
  if (horizontal && vertical) {
    return "dual";
  }

  if (horizontal) {
    return "horizontal";
  }

  if (vertical) {
    return "vertical";
  }

  return "still";
};
