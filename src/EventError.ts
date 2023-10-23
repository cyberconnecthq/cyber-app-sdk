class EventError extends Error {
  public details: string;
  public shortMessage: string;

  constructor({
    name,
    details,
    shortMessage,
  }: {
    name?: string;
    details: string;
    shortMessage?: string;
  }) {
    super(
      `${name || "UnknownEventError"}: ${
        shortMessage || "Unknown error, please check the details"
      }`,
    );
    this.name = name || "UnknownEventError";
    this.details = details;
    this.shortMessage =
      shortMessage || "Unknown error, please check the details";
  }
}

export default EventError;
