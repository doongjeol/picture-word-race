import { createFileRoute } from "@tanstack/react-router";
import BoardGame from "@/game/BoardGame";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <BoardGame />;
}
