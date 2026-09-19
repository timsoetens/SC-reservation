require("dotenv").config();

const fs = require("fs");
const path = require("path");

const API_URL = "https://api.gripp.com/public/api3.php";
const API_TOKEN = process.env.GRIPP_API_TOKEN || "";
const PAGE_SIZE = 250;
const MAX_RETRIES = 3;
const OUTPUT_PATH = path.join(__dirname, "containers.txt");

if (!API_TOKEN) {
  throw new Error("GRIPP_API_TOKEN ontbreekt in .env.");
}

async function callGripp(method, params, attempt = 0) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify([{ method, params, id: 1 }])
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${body.slice(0, 500)}`);
    }

    const [result] = JSON.parse(body);
    if (result?.error) {
      throw new Error(result.error.message || JSON.stringify(result.error));
    }
    return result?.result || {};
  } catch (error) {
    if (attempt < MAX_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      return callGripp(method, params, attempt + 1);
    }
    throw new Error(`Gripp API-call mislukt na ${MAX_RETRIES} pogingen: ${error.message}`);
  }
}

async function fetchAllProjects(filters) {
  const projects = [];
  let offset = 0;

  while (true) {
    const result = await callGripp("project.get", [
      filters,
      {
        paging: { firstresult: offset, maxresults: PAGE_SIZE },
        orderings: [{ field: "project.number", direction: "asc" }]
      }
    ]);
    const rows = Array.isArray(result.rows) ? result.rows : [];
    projects.push(...rows);
    if (rows.length < PAGE_SIZE) {
      return projects;
    }
    offset += PAGE_SIZE;
  }
}

function parseContainer(searchName) {
  const value = String(searchName || "").trim();
  const match = value.match(/^(.*?)(?:\s*\((\d+)\))?$/);
  return {
    number: match?.[2] || "",
    name: (match?.[1] || value).trim()
  };
}

function hasLinkedOffer(project) {
  return Array.isArray(project.projectlines) && project.projectlines.some((line) => {
    const offerBaseId = line.offerprojectbase?.id;
    return offerBaseId && String(offerBaseId) !== String(project.id);
  });
}

function collectContainers(projects, rootProjects) {
  const recordsById = new Map(projects.map((project) => [String(project.id), project]));
  rootProjects.forEach((project) => recordsById.set(String(project.id), project));
  const containers = new Map();

  for (const project of recordsById.values()) {
    if (project.archived === true || !String(project.name || project.searchname || "").trim()) {
      continue;
    }

    const embeddedContainer = project.umbrellaproject;
    if (embeddedContainer?.id) {
      const parent = recordsById.get(String(embeddedContainer.id));
      if (parent?.archived === true) {
        continue;
      }
      const parsed = parseContainer(embeddedContainer.searchname);
      if (parsed.name) {
        containers.set(String(embeddedContainer.id), {
          id: embeddedContainer.id,
          ...parsed
        });
      }
      continue;
    }

    if (!hasLinkedOffer(project)) {
      continue;
    }
    const parsed = parseContainer(project.searchname || project.name);
    if (parsed.name) {
      containers.set(String(project.id), { id: project.id, ...parsed });
    }
  }

  return [...containers.values()].sort((first, second) => {
    return `${first.number} ${first.name}`.localeCompare(`${second.number} ${second.name}`, "nl", { numeric: true, sensitivity: "base" });
  });
}

async function main() {
  const [allProjects, rootProjects] = await Promise.all([
    fetchAllProjects([]),
    fetchAllProjects([{ field: "project.umbrellaproject", operator: "isnull", value: true }])
  ]);
  const containers = collectContainers(allProjects, rootProjects);
  const lines = [
    `Gripp containers export - ${new Date().toISOString()}`,
    "Alle fasen, exclusief archief en archief-containers",
    "ID | Nummer | Naam",
    "",
    ...containers.map((container) => `${container.id} | ${container.number} | ${container.name}`),
    "",
    `TOTAAL CONTAINERS: ${containers.length}`
  ];
  const temporaryPath = `${OUTPUT_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, `${lines.join("\n")}\n`, "utf8");
  fs.renameSync(temporaryPath, OUTPUT_PATH);
  console.log(`containers.txt bijgewerkt: ${containers.length} containers uit ${allProjects.length} projectrecords.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
