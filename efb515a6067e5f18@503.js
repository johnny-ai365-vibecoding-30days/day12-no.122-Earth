import define1 from "./a33468b95d0b15b0@817.js";

function _chart(d3, productionData, Legend, countries, countrymesh, formatNumber) {
  const width = 980;
  const marginTop = 36;
  const height = width / 2 + marginTop;

  const projection = d3.geoEqualEarth().fitExtent(
    [[8, marginTop + 4], [width - 8, height]],
    { type: "Sphere" }
  );
  const path = d3.geoPath(projection);

  const valueMap = new Map(productionData.map((d) => [d.name, d.production]));
  const maxProduction = d3.max(productionData, (d) => d.production);

  const color = d3.scaleSequentialSqrt([0, maxProduction], d3.interpolateYlGnBu);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  svg
    .append("g")
    .attr("transform", "translate(28,8)")
    .append(() =>
      Legend(color, {
        title: "2024 年稀土產量（公噸）",
        width: 280,
        tickFormat: (d) => formatNumber(d)
      })
    );

  svg
    .append("path")
    .datum({ type: "Sphere" })
    .attr("fill", "#f8fafc")
    .attr("stroke", "#0f172a")
    .attr("stroke-width", 0.6)
    .attr("d", path);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .append("g")
    .selectAll("path")
    .data(countries.features)
    .join("path")
    .attr("fill", (d) => {
      const value = valueMap.get(d.properties.name);
      return value !== undefined ? color(value) : "#e2e8f0";
    })
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.5)
    .attr("d", path)
    .on("mouseenter", (event, d) => {
      const value = valueMap.get(d.properties.name);
      tooltip
        .classed("visible", true)
        .html(
          `<strong>${d.properties.name}</strong><br/>` +
            (value !== undefined
              ? `${formatNumber(value)} 公噸`
              : "尚無資料")
        );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.pageX + 14}px`)
        .style("top", `${event.pageY - 12}px`);
    })
    .on("mouseleave", () => {
      tooltip.classed("visible", false);
    });

  svg
    .append("path")
    .datum(countrymesh)
    .attr("fill", "none")
    .attr("stroke", "#f8fafc")
    .attr("stroke-width", 0.6)
    .attr("d", path);

  return svg.node();
}

async function _productionData(FileAttachment, rename) {
  const raw = await FileAttachment("data.json").json();
  return raw.map((d) => ({
    name: rename.get(d.country) || d.country,
    production: +d.production,
    unit: d.unit,
    year: d.year
  }));
}

function _rename() {
  return new Map([["United States", "United States of America"]]);
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

function _formatNumber(d3) {
  return d3.format(",");
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
        toString
      }
    ],
    [
      "data.json",
      {
        url: new URL("./data.json", import.meta.url),
        mimeType: "application/json",
        toString
      }
    ]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments((name) => fileAttachments.get(name)));
  const child1 = runtime.module(define1);
  main.import("Legend", child1);
  main.variable(observer("chart")).define("chart", ["d3", "productionData", "Legend", "countries", "countrymesh", "formatNumber"], _chart);
  main.variable(observer("productionData")).define("productionData", ["FileAttachment", "rename"], _productionData);
  main.variable(observer("rename")).define("rename", _rename);
  main.variable(observer("world")).define("world", ["FileAttachment"], _world);
  main.variable(observer("countries")).define("countries", ["topojson", "world"], _countries);
  main.variable(observer("countrymesh")).define("countrymesh", ["topojson", "world"], _countrymesh);
  main.variable(observer("formatNumber")).define("formatNumber", ["d3"], _formatNumber);
  return main;
}
