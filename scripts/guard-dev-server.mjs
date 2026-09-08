/**
 * Refuses to start a production build while `next dev` is running.
 *
 * Both commands write the same .next directory. Building over a live dev
 * server interleaves production and development artifacts: the client CSS and
 * JS chunks 404, and because `next build` does not clear
 * .next/cache/webpack/client-development, the dev compiler then believes those
 * chunks are already emitted and never rewrites them. The page renders with no
 * stylesheet at all (Times New Roman, unstyled buttons, sr-only text showing),
 * and recovery needs a full `rm -rf .next`, not just a restart.
 *
 * CI and Vercel have nothing listening on the dev port, so this is a no-op
 * there. Set ALLOW_BUILD_WITH_DEV=1 to override deliberately.
 */
import net from "node:net";

const PORT = Number(process.env.PORT_DEV ?? 3002);

if (process.env.ALLOW_BUILD_WITH_DEV === "1") {
  process.exit(0);
}

const inUse = await new Promise((resolve) => {
  const socket = net.connect({ host: "127.0.0.1", port: PORT });
  const done = (result) => {
    socket.destroy();
    resolve(result);
  };
  socket.setTimeout(1200);
  socket.once("connect", () => done(true));
  socket.once("timeout", () => done(false));
  socket.once("error", () => done(false));
});

if (inUse) {
  console.error(
    [
      "",
      `  Build refused: something is already serving on port ${PORT}.`,
      "",
      "  `next build` and `next dev` share the .next directory, so building now",
      "  would corrupt the running dev server (blank styles, 404 chunks) and need",
      "  a full `rm -rf .next` to recover.",
      "",
      "  Stop the dev server first, then build:",
      "",
      "    npm run build",
      "",
      "  Or override if you know the port belongs to something else:",
      "",
      "    ALLOW_BUILD_WITH_DEV=1 npm run build",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
