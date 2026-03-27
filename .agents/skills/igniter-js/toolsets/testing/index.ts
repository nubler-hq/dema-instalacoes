import { FractalToolset } from "@fractal/plugins";
import { getSchemaTool } from "./tools/get-schema.tool";

export default FractalToolset.create("testing")
  .withDescription("Toolset for testing Igniter-js APPs")
  .withRules([
    {
      type: "always",
      instruction: "Only use this toolsets when you need to test the Igniter.js APIs"
    },
  ])
  .withConnection({
    type: "custom"
  })
  .addTool(getSchemaTool)
  .build();