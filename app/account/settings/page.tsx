import { redirect } from "next/navigation";

/** Permanent redirect — settings merged into /account; keeps old links / OAuth callbacks working. */
const SettingsRedirect = () => {
  redirect("/account");
};

export default SettingsRedirect;
