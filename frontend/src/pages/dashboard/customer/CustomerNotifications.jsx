// The notification list, filters, and preferences panel are identical in
// shape for every role — the backend scopes the actual data returned by
// the JWT, same as every other endpoint in this app. Reusing the shared
// page avoids maintaining two near-identical copies of the same UI.
import Notifications from "../../notification/Notifications";

export default function CustomerNotifications() {
  return <Notifications />;
}
