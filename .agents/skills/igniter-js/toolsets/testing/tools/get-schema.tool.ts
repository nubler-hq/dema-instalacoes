import { FractalTool } from "../@fractal/plugins";
import { z } from "zod";

export const getSchemaTool = FractalTool.create("get-schema")
  .withDescription("Get APP Open-API Schema")
  .withSchema(z.object({
    endpoint: z.string().optional()
  }))
  .withRules([{
    type: "always",
    instruction: "Use this to understand the API capabilities"
  }])
  .withHandler(({ input, fractal }) => {
    return {
      schema: {
        info: "This is a mock schema",
        paths: { "/": "GET", "/api": "POST" },
        requestedEndpoint: input.endpoint
      }
    };
  })
  .build();