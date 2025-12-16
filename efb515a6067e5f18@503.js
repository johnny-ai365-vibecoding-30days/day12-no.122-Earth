import define1 from "./a33468b95d0b15b0@817.js";

function _1(md){
  return md`
# 全球稀土產量地圖
**滑鼠移到地圖上查看各國 2024 年稀土產量（公噸）。**
`;
}

function _chart(d3, productionData, Legend, countries, countrymesh, formatNumber) {
  const width = 960;
  const marginTop = 70;
  const height = width / 2 + marginTop;

  const projection = d3.geoEqualEarth().fitExtent(
    [[2, marginTop + 2], [width - 2, height]],
    {type: "Sphere"}
  );
  const path = d3.geoPath(projection);

  const valueMap = new Map(productionData.map(d => [d.name, d.production]));
  const maxValue = d3.max(valueMap.values());
  const color = d3.scaleSequential([0, maxValue], d3.interpolateYlGnBu);
  const missingColor = "#f0f0f0";

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; background: white;");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .attr("font-size", "22px")
    .attr("font-weight", "700")
    .text("2024 年全球稀土產量");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 52)
    .attr("text-anchor", "middle")
    .attr("fill", "#555")
    .attr("font-size", "14px")
    .text("單位：公噸，數據來源：data.json");

  svg.append("g")
    .attr("transform", "translate(20,70)")
    .append(() => Legend(color, {title: "稀土產量（公噸）", width: 320}));

  svg.append("path")
    .datum({type: "Sphere"})
    .attr("fill", "#ffffff")
    .attr("stroke", "#999")
    .attr("d", path);

  svg.append("g")
    .selectAll("path")
    .data(countries.features)
    .join("path")
      .attr("fill", d => {
        const value = valueMap.get(d.properties.name);
        return value == null ? missingColor : color(value);
      })
      .attr("d", path)
    .append("title")
      .text(d => {
        const value = valueMap.get(d.properties.name);
        const displayValue = value == null ? "無資料" : `${formatNumber(value)} 公噸`;
        return `${d.properties.name}\n${displayValue}`;
      });

  svg.append("path")
    .datum(countrymesh)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 0.6)
    .attr("d", path);

  return svg.node();
}

async function _productionData(FileAttachment, rename) {
  const raw = await FileAttachment("data.json").json();
  return raw.map(d => ({
    name: rename.get(d.country) || d.country,
    originalName: d.country,
    production: +d.production,
    unit: d.unit,
    year: d.year
  }));
}

function _rename(){
  return new Map([
    ["United States", "United States of America"],
  ]);
}

function _world(FileAttachment){
  return FileAttachment("countries-50m.json").json();
}

function _countries(topojson, world){
  return topojson.feature(world, world.objects.countries);
}

function _countrymesh(topojson, world){
  return topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
}

function _formatNumber(){
  const formatter = new Intl.NumberFormat("zh-TW");
  return value => formatter.format(value);
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["countries-50m.json", {url: new URL("./files/105124169f32536c2c86c7d6a237673814f21444a667f2cb8c4e2b3f7b3cfae56fac5346a6ac7fd5cc02b63fcda1b08ac4e86a7c86896e5eeb37b51ccceb8f69.json", import.meta.url), mimeType: "application/json", toString}],
    ["data.json", {url: new URL("./data.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3", "productionData", "Legend", "countries", "countrymesh", "formatNumber"], _chart);
  main.variable(observer("productionData")).define("productionData", ["FileAttachment", "rename"], _productionData);
  main.variable(observer("rename")).define("rename", _rename);
  main.variable(observer("world")).define("world", ["FileAttachment"], _world);
  main.variable(observer("countries")).define("countries", ["topojson", "world"], _countries);
  main.variable(observer("countrymesh")).define("countrymesh", ["topojson", "world"], _countrymesh);
  main.variable(observer("formatNumber")).define("formatNumber", _formatNumber);
  const child1 = runtime.module(define1);
  main.import("Legend", child1);
  return main;
}
