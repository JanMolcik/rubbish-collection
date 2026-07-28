#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ALLOWED_ADVISORY = "GHSA-mh99-v99m-4gvg";
const ALLOWED_PACKAGE = "brace-expansion";
const ALLOWED_NODES = ["node_modules/minimatch/node_modules/brace-expansion"];

function runAudit(args) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["audit", ...args, "--json"], {
    encoding: "utf8",
    env: { ...process.env, npm_config_audit_level: "low" },
  });

  if (result.error) {
    throw new Error(`Unable to run npm audit: ${result.error.message}`);
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `npm audit did not return valid JSON (exit ${result.status ?? "unknown"}): ${result.stderr.trim()}`,
    );
  }

  if (report.error || report.auditReportVersion !== 2 || !report.vulnerabilities) {
    throw new Error(`npm audit returned an unusable report: ${JSON.stringify(report.error ?? report)}`);
  }

  return report;
}

function advisoryId(entry) {
  return entry.url?.split("/").pop();
}

function rootAdvisories(vulnerabilities, name, seen = new Set()) {
  if (seen.has(name)) {
    throw new Error(`npm audit dependency cycle encountered at ${name}`);
  }

  const vulnerability = vulnerabilities[name];
  if (!vulnerability) {
    throw new Error(`npm audit references missing vulnerability ${name}`);
  }

  const nextSeen = new Set(seen).add(name);
  return vulnerability.via.flatMap((via) =>
    typeof via === "string"
      ? rootAdvisories(vulnerabilities, via, nextSeen)
      : [{ packageName: name, advisory: via }],
  );
}

function sameNodes(actual, expected) {
  return (
    actual.length === expected.length &&
    [...actual].sort().every((node, index) => node === [...expected].sort()[index])
  );
}

function assertAuditPolicy(productionReport, fullReport) {
  const productionNames = Object.keys(productionReport.vulnerabilities);
  if (productionNames.length > 0) {
    throw new Error(`Production dependency vulnerabilities are not allowed: ${productionNames.join(", ")}`);
  }

  const vulnerabilities = fullReport.vulnerabilities;
  const names = Object.keys(vulnerabilities);
  if (names.length === 0) {
    return "Full dependency audit is clean; the temporary allowlist was not used.";
  }

  const allowlistedRoot = vulnerabilities[ALLOWED_PACKAGE];
  if (
    !allowlistedRoot ||
    allowlistedRoot.isDirect ||
    !sameNodes(allowlistedRoot.nodes ?? [], ALLOWED_NODES)
  ) {
    throw new Error(
      `The allowlisted ${ALLOWED_PACKAGE} advisory is not confined to ${ALLOWED_NODES.join(", ")}`,
    );
  }

  for (const name of names) {
    const roots = rootAdvisories(vulnerabilities, name);
    if (roots.length === 0) {
      throw new Error(`Vulnerability ${name} has no traceable advisory`);
    }

    for (const { packageName, advisory } of roots) {
      if (packageName !== ALLOWED_PACKAGE || advisoryId(advisory) !== ALLOWED_ADVISORY) {
        throw new Error(
          `Unallowlisted vulnerability: ${packageName} ${advisoryId(advisory) ?? advisory.title ?? "unknown"}`,
        );
      }
    }
  }

  const counts = fullReport.metadata?.vulnerabilities;
  const total = counts?.total ?? names.length;
  return (
    `Full dependency audit: ${total} aggregated finding(s), all dev-only and traceable to ` +
    `${ALLOWED_ADVISORY} at ${ALLOWED_NODES.join(", ")}.`
  );
}

export { assertAuditPolicy };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const productionReport = runAudit(["--omit=dev"]);
    const fullReport = runAudit([]);
    const result = assertAuditPolicy(productionReport, fullReport);
    console.log("Production dependency audit: 0 vulnerabilities.");
    console.log(result);
  } catch (error) {
    console.error(`Dependency audit policy failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
