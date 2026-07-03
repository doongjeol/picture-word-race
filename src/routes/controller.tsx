import { createFileRoute } from "@tanstack/react-router";
import ControllerScreen from "@/game/ControllerScreen";

export const Route = createFileRoute("/controller")({
  component: ControllerScreen,
});