import defineLegend from "./a33468b95d0b15b0@817.js";

function _page(d3, productionData, Legend, countries, countrymesh, rename, displayNames) {
  const width = 960;
  const marginTop = 60;
  const height = width / 2 + marginTop;

  const year = d3.max(productionData, (d) => d.year);
  const valueMap = new Map(
    productionData.map((d) => [rename.get(d.country) ?? d.country, d.production])
  );
  const values = Array.from(valueMap.values());
  const color = d3
    .scaleSequential(d3.extent(values), d3.interpolateYlGnBu)
    .unknown("#f0f0f0");

  const projection = d3
    .geoEqualEarth()
    .fitExtent(
      [
        [2, marginTop + 2],
        [width - 2, height],
      ],
      { type: "Sphere" }
    );
  const path = d3.geoPath(projection);

  const container = document.createElement("div");
  Object.assign(container.style, {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1f2937",
  });

  const title = document.createElement("h1");
  title.textContent = `2024 年全球稀土產量地圖`;
  title.style.margin = "0 0 8px";
  container.append(title);

  const intro = document.createElement("p");
  intro.textContent = `資料來源：data.json。以等積圓柱投影顯示各國 2024 年稀土產量（公噸），將滑鼠移到國家可檢視數值。`;
  intro.style.margin = "0 0 16px";
  intro.style.lineHeight = "1.6";
  container.append(intro);

  const chartWrapper = document.createElement("div");
  Object.assign(chartWrapper.style, {
    position: "relative",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    padding: "12px",
  });
  container.append(chartWrapper);

  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "absolute",
    pointerEvents: "none",
    background: "rgba(31, 41, 55, 0.92)",
    color: "white",
    padding: "8px 10px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.4",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    display: "none",
    transform: "translate(10px, 10px)",
  });
  chartWrapper.append(tooltip);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  svg
    .append("g")
    .attr("transform", "translate(20,0)")
    .append(() => Legend(color, { title: "年產量（公噸）", width: 260 }));

  svg
    .append("path")
    .datum({ type: "Sphere" })
    .attr("fill", "#f9fafb")
    .attr("stroke", "#374151")
    .attr("stroke-width", 0.6)
    .attr("d", path);

  const countriesGroup = svg.append("g");

  const handleMove = (event, d) => {
    const name = d.properties.name;
    const production = valueMap.get(name);
    const label = displayNames.get(name) ?? name;

    tooltip.style.display = "block";
    tooltip.textContent = production
      ? `${label}：${production.toLocaleString()} 公噸`
      : `${label}：無資料`;

    const [x, y] = d3.pointer(event);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;

    d3.select(event.currentTarget).attr("stroke", "#111827").attr("stroke-width", 1.2);
  };

  const handleLeave = (event) => {
    tooltip.style.display = "none";
    d3.select(event.currentTarget).attr("stroke", "white").attr("stroke-width", 0.6);
  };

  countriesGroup
    .selectAll("path")
    .data(countries.features)
    .join("path")
    .attr("fill", (d) => color(valueMap.get(d.properties.name)))
    .attr("stroke", "white")
    .attr("stroke-width", 0.6)
    .attr("d", path)
    .on("pointerenter", handleMove)
    .on("pointermove", handleMove)
    .on("pointerleave", handleLeave);

  svg
    .append("path")
    .datum(countrymesh)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 0.6)
    .attr("d", path);

  chartWrapper.append(svg.node());

  const footnote = document.createElement("p");
  footnote.textContent = year
    ? `最新年份：${year}，單位：公噸。灰色區域表示 data.json 中未提供資料。`
    : `灰色區域表示 data.json 中未提供資料，單位：公噸。`;
  footnote.style.margin = "12px 0 0";
  footnote.style.fontSize = "13px";
  footnote.style.color = "#4b5563";
  footnote.style.lineHeight = "1.5";
  container.append(footnote);

  return container;
}

async function _productionData(d3) {
  const data = await d3.json("./data.json");
  return Array.isArray(data) ? data : [];
}

function _rename() {
  return new Map([["United States", "United States of America"]]);
}

function _displayNames() {
  return new Map([
    ["China", "中國"],
    ["United States of America", "美國"],
    ["Myanmar", "緬甸"],
    ["Australia", "澳洲"],
    ["Thailand", "泰國"],
    ["India", "印度"],
    ["Russia", "俄羅斯"],
    ["Vietnam", "越南"],
  ]);
}

function _world(FileAttachment) {
  return FileAttachment("countries-50m.json").json();
}

function _countries(topojson, world) {
  return topojson.feature(world, world.objects.countries);
}

function _countrymesh(topojson, world) {
  return topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      "countries-50m.json",
      {
        url: new URL(
          "./files/105124169f32536c2c86c7d6a237673814f21444a667f2cb8c4e2b3f7b3cfae56fac5346a6ac7fd5cc02b63fcda1b08ac4e86a7c86896e5eeb37b51ccceb8f69.json",
          import.meta.url
        ),
        mimeType: "application/json",
        toString,
      },
    ],
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments((name) => fileAttachments.get(name)));
  const child1 = runtime.module(defineLegend);
  main.import("Legend", child1);
  main.variable(observer("page")).define("page", ["d3", "productionData", "Legend", "countries", "countrymesh", "rename", "displayNames"], _page);
  main.variable(observer("productionData")).define("productionData", ["d3"], _productionData);
  main.variable(observer("rename")).define("rename", _rename);
  main.variable(observer("displayNames")).define("displayNames", _displayNames);
  main.variable(observer("world")).define("world", ["FileAttachment"], _world);
  main.variable(observer("countries")).define("countries", ["topojson", "world"], _countries);
  main.variable(observer("countrymesh")).define("countrymesh", ["topojson", "world"], _countrymesh);
  return main;
}
