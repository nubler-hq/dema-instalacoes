#!/usr/bin/env bun

import {
  type ClassDeclaration,
  type InterfaceDeclaration,
  type JSDocableNode,
  type SignaturedDeclaration,
  Node,
  Project,
  SyntaxKind,
} from "ts-morph";

type ApiParam = {
  name: string;
  type: string;
  optional: boolean;
};

type ApiSignature = {
  parameters: ApiParam[];
  returnType: string;
};

type ApiMember = {
  name: string;
  type: string;
  optional: boolean;
  tsdoc: string | null;
};

type ApiExport = {
  name: string;
  kind: string;
  tsdoc: string | null;
  signatures?: ApiSignature[];
  typeText?: string;
  members?: ApiMember[];
};

type ApiDocOutput = {
  file: string;
  exports: ApiExport[];
};

const args = process.argv.slice(2);

const getArg = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const root = getArg("--path") ?? getArg("--package") ?? ".";
const typesPath = getArg("--types") ?? "dist/index.d.ts";
const format = (getArg("--format") ?? "json") as "json" | "md";
const normalizePaths = (getArg("--normalize-paths") ?? "true").toLowerCase() !== "false";
const packageAlias = getArg("--path-alias") ?? "<package>";
const packageName = root.includes("node_modules/") ? root.split("node_modules/")[1] : null;

const filePath = `${root.replace(/\/$/, "")}/${typesPath}`;

const project = new Project({
  skipAddingFilesFromTsConfig: true,
});

const sourceFile = project.addSourceFileAtPath(filePath);
const exportMap = sourceFile.getExportedDeclarations();

const exports: ApiExport[] = [];

for (const [name, declarations] of exportMap.entries()) {
  declarations.forEach((decl) => {
    const kind = decl.getKindName();
    const tsdoc = getJsDocText(decl as JSDocableNode);

    const apiExport: ApiExport = {
      name,
      kind,
      tsdoc,
    };

    if (Node.isFunctionDeclaration(decl)) {
      apiExport.signatures = [getSignature(decl)];
    }

    if (Node.isTypeAliasDeclaration(decl)) {
      apiExport.typeText = decl.getText();
    }

    if (Node.isInterfaceDeclaration(decl)) {
      apiExport.members = getInterfaceMembers(decl);
    }

    if (Node.isClassDeclaration(decl)) {
      apiExport.members = getClassMembers(decl);
      const signatures = decl
        .getMethods()
        .filter((method) => method.isStatic())
        .map((method) => getSignature(method));
      if (signatures.length > 0) {
        apiExport.signatures = signatures;
      }
    }

    exports.push(apiExport);
  });
}

const output: ApiDocOutput = {
  file: filePath,
  exports,
};

if (format === "json") {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`# API Doc`);
  console.log(`- File: ${filePath}`);
  console.log(`- Exports: ${exports.length}\n`);

  exports.forEach((item) => {
    console.log(`## ${item.name}`);
    console.log(`- Kind: ${item.kind}`);
    if (item.tsdoc) {
      console.log("**TSDoc**");
      console.log("```ts");
      console.log(item.tsdoc);
      console.log("```");
    }
    if (item.signatures?.length) {
      console.log("**Signatures**");
      item.signatures.forEach((signature) => {
        console.log("- Parameters:");
        signature.parameters.forEach((param) => {
          console.log(`  - ${param.name}${param.optional ? "?" : ""}: ${param.type}`);
        });
        console.log(`- Returns: ${signature.returnType}`);
      });
    }
    if (item.members?.length) {
      console.log("**Members**");
      item.members.forEach((member) => {
        console.log(`- ${member.name}${member.optional ? "?" : ""}: ${member.type}`);
      });
    }
    if (item.typeText) {
      console.log("**Type**");
      console.log("```ts");
      console.log(item.typeText);
      console.log("```");
    }
    console.log("");
  });
}

export {};

function getSignature(declaration: SignaturedDeclaration): ApiSignature {
  const signature = declaration.getSignature ? declaration.getSignature() : null;
  if (!signature) {
    return { parameters: [], returnType: "void" };
  }

  const parameters = signature.getParameters().map((param) => {
    const decl = param.getDeclarations()[0];
    const type = decl
      ? normalizeTypeText(decl.getType().getText())
      : normalizeTypeText(param.getTypeAtLocation(declaration as unknown as Node).getText());
    const optional = decl && Node.isParameterDeclaration(decl) ? decl.isOptional() : false;

    return {
      name: param.getName(),
      type,
      optional,
    };
  });

  return {
    parameters,
    returnType: normalizeTypeText(signature.getReturnType().getText()),
  };
}

function getInterfaceMembers(declaration: InterfaceDeclaration): ApiMember[] {
  return declaration.getProperties().map((prop: any) => ({
    name: prop.getName(),
    type: normalizeTypeText(prop.getType().getText()),
    optional: prop.hasQuestionToken(),
    tsdoc: getJsDocText(prop as JSDocableNode),
  }));
}

function getClassMembers(declaration: ClassDeclaration): ApiMember[] {
  return declaration.getProperties().map((prop: any) => ({
    name: prop.getName(),
    type: normalizeTypeText(prop.getType().getText()),
    optional: prop.hasQuestionToken(),
    tsdoc: getJsDocText(prop as JSDocableNode),
  }));
}

function getJsDocText(declaration: JSDocableNode) {
  const docs = declaration.getJsDocs?.() ?? [];
  if (!docs.length) return null;
  return docs.map((doc: any) => doc.getText()).join("\n");
}

function normalizeTypeText(value: string) {
  if (!normalizePaths) return value;
  const workspaceRoot = process.cwd();
  const normalizedRoot = root.replace(/^\./, "").replace(/^[\/]+/, "");
  const absoluteRoot = `${workspaceRoot.replace(/\/$/, "")}/${normalizedRoot}`;
  return value
    .replace(new RegExp(escapeRegExp(absoluteRoot), "g"), packageAlias)
    .replace(
      packageName ? new RegExp(escapeRegExp(`${workspaceRoot}/node_modules/${packageName}`), "g") : /$^/,
      packageAlias,
    )
    .replace(
      packageName ? new RegExp(escapeRegExp(`${workspaceRoot}/${packageName}`), "g") : /$^/,
      packageAlias,
    )
    .replace(new RegExp(escapeRegExp(workspaceRoot), "g"), "<workspace>")
    .replace(packageName ? new RegExp(escapeRegExp(`<workspace>/node_modules/${packageName}`), "g") : /$^/, packageAlias)
    .replace(packageName ? new RegExp(escapeRegExp(`<workspace>/${packageName}`), "g") : /$^/, packageAlias)
    .replace(new RegExp(escapeRegExp(root), "g"), packageAlias);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
