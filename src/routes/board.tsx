import { createFileRoute } from "@tanstack/react-router";
import BoardScreen from "@/game/BoardScreen";

export const Route = createFileRoute("/board")({
  component: BoardScreen,
});