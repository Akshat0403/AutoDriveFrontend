"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import carsData from "../All.json";

const CARS_PER_PAGE = 9;

// ─── FORMAT INR ──────────────────────────────────────────────────────────────
function formatINRs(val: string | number | null | undefined): string {
  const num = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  if (!num || isNaN(num)) return "N/A";

  // Abbreviate large values
  if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(2)} Cr`;
  if (num >= 100_000) return `₹${(num / 100_000).toFixed(1)} L`;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

// ─── RAW JSON CAR TYPE (camelCase from your JSON file) ───────────────────────
interface JsonCar {
  car_id: number;
  city: string;
  price: number;
  makeYear: string;
  registrationYear: string;
  make: string;
  model: string;
  fuelType: string;
  KmDriven: number;
  transmission: string;
  bodyType: string;
  no_of_owner: string;
  groundClearance: string;
  bootSpace: string;
  seatingRows: string;
  wheelBase: string;
  length: string;
  FrontTyreSize: string;
  rearTyreSize: string;
  doors: string;
  height: string;
  width: string;
  kerbWeight: string;
  gearBox: string;
  gears: string;
  displacement: string;
  mileageARAI: string;
  maxPower: string;
  maxTorque: string;
  cylinders: string;
  drive: string;
  valveConfig: string;
  turbo: string;
  suspensionFront: string;
  suspensionRear: string;
  steeringAdjType: string;
  steeringAdj: string;
  frontBrake: string | null;
  rearBrake: string | null;
  steeringType: string;
  alloyWheels: string;
  core_rating: number;
  support_rating: number;
  interior_rating: number;
  exterior_rating: number;
  wear_rating: number;
  all_images: string;
  bg_removed_img: string;
  thumbnails: string;
}

// ─── NORMALIZED CAR TYPE (used throughout the component) ─────────────────────
interface ApiCar {
  id: string;
  car_id: number;
  make: string;
  model: string;
  make_year: string;
  registration_year: string;
  price: string;
  fuel_type: string;
  transmission: string;
  km_driven: number;
  mileage_arai: string;
  body_type: string;
  city: string;
  thumbnails: string;
  bg_removed_img: string;
  all_images: string;
  cylinders: string;
  displacement: string;
  doors: string;
  drive: string;
  front_tyre_size: string;
  rear_tyre_size: string;
  front_brake: string | null;
  rear_brake: string | null;
  gear_box: string;
  gears: string;
  ground_clearance: string;
  height: string;
  kerb_weight: string;
  length: string;
  max_power: string;
  max_torque: string;
  no_of_owner: string;
  seating_rows: string;
  steering_adj: string;
  steering_adj_type: string;
  steering_type: string;
  suspension_front: string;
  suspension_rear: string;
  turbo: string;
  valve_config: string;
  wheel_base: string;
  width: string;
  boot_space: string;
  alloy_wheels: string;
  core_rating: string;
  exterior_rating: string;
  interior_rating: string;
  wear_rating: string;
  support_rating: string;
}

// ─── MAPPER: JSON → ApiCar ────────────────────────────────────────────────────
function mapJsonCarToApiCar(c: JsonCar, index: number): ApiCar {
  return {
    id: String(c.car_id ?? index),
    car_id: c.car_id,
    make: c.make,
    model: c.model,
    make_year: c.makeYear,
    registration_year: c.registrationYear,
    price: String(c.price),
    fuel_type: c.fuelType,
    transmission: c.transmission,
    km_driven: c.KmDriven,
    mileage_arai: c.mileageARAI,
    body_type: c.bodyType,
    city: c.city,
    thumbnails: c.thumbnails,
    bg_removed_img: c.bg_removed_img,
    all_images: c.all_images,
    cylinders: c.cylinders,
    displacement: c.displacement,
    doors: c.doors,
    drive: c.drive,
    front_tyre_size: c.FrontTyreSize,
    rear_tyre_size: c.rearTyreSize,
    front_brake: c.frontBrake,
    rear_brake: c.rearBrake,
    gear_box: c.gearBox,
    gears: c.gears,
    ground_clearance: c.groundClearance,
    height: c.height,
    kerb_weight: c.kerbWeight,
    length: c.length,
    max_power: c.maxPower,
    max_torque: c.maxTorque,
    no_of_owner: c.no_of_owner,
    seating_rows: c.seatingRows,
    steering_adj: c.steeringAdj,
    steering_adj_type: c.steeringAdjType,
    steering_type: c.steeringType,
    suspension_front: c.suspensionFront,
    suspension_rear: c.suspensionRear,
    turbo: c.turbo,
    valve_config: c.valveConfig,
    wheel_base: c.wheelBase,
    width: c.width,
    boot_space: c.bootSpace,
    alloy_wheels: c.alloyWheels,
    core_rating: String(c.core_rating),
    exterior_rating: String(c.exterior_rating),
    interior_rating: String(c.interior_rating),
    wear_rating: String(c.wear_rating),
    support_rating: String(c.support_rating),
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function parseYear(makeYear: string): number {
  if (!makeYear) return 0;
  const parts = makeYear.split("-");
  const yr = parseInt(parts[parts.length - 1]);
  return yr < 100 ? 2000 + yr : yr;
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function getFuelIcon(fuelType: string): string {
  const f = (fuelType || "").toLowerCase();
  if (f === "electric") return "EV";
  if (f === "hybrid") return "HY";
  return "ICE";
}

// ─── CAR MODAL ───────────────────────────────────────────────────────────────
function CarModal({ car, onClose }: { car: ApiCar; onClose: () => void }) {
  const rows: [string, string][] = [
    ["Front Tyre Size", car.front_tyre_size ?? "—"],
    ["Km Driven", String(car.km_driven)],
    ["Body Type", capitalize(car.body_type ?? "")],
    ["Boot Space", car.boot_space ?? "—"],
    ["Car ID", String(car.car_id ?? "—")],
    ["City", car.city ?? "—"],
    ["Core Rating", car.core_rating ?? "—"],
    ["Cylinders", car.cylinders ?? "—"],
    ["Displacement", car.displacement ?? "—"],
    ["Doors", car.doors ?? "—"],
    ["Drive", car.drive ?? "—"],
    ["Exterior Rating", car.exterior_rating ?? "—"],
    ["Front Brake", car.front_brake ?? "—"],
    ["Fuel Type", capitalize(car.fuel_type ?? "")],
    ["Gear Box", car.gear_box ?? "—"],
    ["Gears", car.gears ?? "—"],
    ["Ground Clearance", car.ground_clearance ?? "—"],
    ["Height", car.height ?? "—"],
    ["Interior Rating", car.interior_rating ?? "—"],
    ["Kerb Weight", car.kerb_weight ?? "—"],
    ["Length", car.length ?? "—"],
    ["Make", car.make ?? "—"],
    ["Make Year", car.make_year ?? "—"],
    ["Max Power", car.max_power ?? "—"],
    ["Max Torque", car.max_torque ?? "—"],
    ["Mileage", car.mileage_arai ?? "—"],
    ["Model", car.model ?? "—"],
    ["No of Owners", car.no_of_owner ?? "—"],
    ["Price", formatINRs(car.price)],
    ["Rear Brake", car.rear_brake ?? "—"],
    ["Rear Tyre Size", car.rear_tyre_size ?? "—"],
    ["Registration Year", car.registration_year ?? "—"],
    ["Seating Rows", car.seating_rows ?? "—"],
    ["Steering Adjustment", car.steering_adj ?? "—"],
    ["Steering Adjustment Types", car.steering_adj_type ?? "—"],
    ["Steering Type", car.steering_type ?? "—"],
    ["Support Rating", car.support_rating ?? "—"],
    ["Suspension Front", car.suspension_front ?? "—"],
    ["Suspension Rear", car.suspension_rear ?? "—"],
    ["Transmission", capitalize(car.transmission ?? "")],
    ["Turbo", car.turbo ?? "—"],
    ["Valve Config", car.valve_config ?? "—"],
    ["Wear Rating", car.wear_rating ?? "—"],
    ["Wheel Base", car.wheel_base ?? "—"],
    ["Width", car.width ?? "—"],
    ["Alloy Wheels", car.alloy_wheels ?? "—"],
  ];

  const imgList = car.all_images
    ? car.all_images
        .split(",")
        .filter((u) => /\.(jpe?g|png|JPG)$/i.test(u.trim()))
    : [];
  const [activeImg, setActiveImg] = useState(
    car.thumbnails || car.bg_removed_img || "",
  );

  return (
    <div
      className="modal-overlay open"
      id="carModal"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "carModal") onClose();
      }}
    >
      <div className="modal" style={{ maxWidth: "750px" }}>
        <div className="modal-header">
          <h2>
            {car.make_year} {car.make} {car.model}
          </h2>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-car-image">
            <img
              src={activeImg || car.thumbnails}
              alt={`${car.make_year} ${car.make} ${car.model}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "var(--radius-lg)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = car.thumbnails;
              }}
            />
          </div>

          {imgList.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {imgList.slice(0, 10).map((url, idx) => (
                <img
                  key={idx}
                  src={url.trim()}
                  alt={`view-${idx}`}
                  onClick={() => setActiveImg(url.trim())}
                  style={{
                    width: 64,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    flexShrink: 0,
                    border:
                      activeImg === url.trim()
                        ? "2px solid var(--blue)"
                        : "2px solid transparent",
                    opacity: activeImg === url.trim() ? 1 : 0.6,
                    transition: "all 0.2s",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ))}
            </div>
          )}

          <div className="detail-specs-grid">
            {[
              ["Yr", "Year", car.make_year ?? "—"],
              [
                "KM",
                "KM Driven",
                car.km_driven != null
                  ? `${Math.round(car.km_driven / 1000)}k km`
                  : "—",
              ],
              [
                getFuelIcon(car.fuel_type),
                "Fuel",
                capitalize(car.fuel_type ?? ""),
              ],
              ["AT", "Transmission", capitalize(car.transmission ?? "")],
            ].map(([icon, label, val]) => (
              <div className="detail-spec" key={label}>
                <div className="detail-spec-icon">{icon}</div>
                <div className="detail-spec-label">{label}</div>
                <div className="detail-spec-val">{val}</div>
              </div>
            ))}
          </div>

          <div className="detail-features">
            <h4>Ratings</h4>
            <div className="feature-tags">
              {[
                `Core: ${car.core_rating ?? "—"}`,
                `Exterior: ${car.exterior_rating ?? "—"}`,
                `Interior: ${car.interior_rating ?? "—"}`,
                `Wear: ${car.wear_rating ?? "—"}`,
                `Support: ${car.support_rating ?? "—"}`,
              ].map((tag) => (
                <span key={tag} className="feature-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-price-row">
            <div>
              <div
                style={{
                  fontSize: ".8rem",
                  color: "var(--text-light)",
                  marginBottom: ".25rem",
                }}
              >
                Listed Price
              </div>
              <div className="detail-price">{formatINRs(car.price)}</div>
            </div>
            <div className="detail-actions">
              <Link href="/booking" className="btn btn-outline btn-sm">
                Test Drive
              </Link>
              <Link href="/booking" className="btn btn-primary">
                Buy Now
              </Link>
            </div>
          </div>

          <div className="full-specs-section">
            <h3 className="full-specs-title">Full Specifications</h3>
            <div className="full-specs-table">
              {rows.map(([k, v]) => (
                <div className="spec-row" key={k}>
                  <span className="spec-key">{k}</span>
                  <span className="spec-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function CarsPage() {
  const [make, setMake] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [fuels, setFuels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalCar, setModalCar] = useState<ApiCar | null>(null);
  const [allCars, setAllCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);

  const dataMaxPrice = allCars.reduce((mx, c) => {
    const p = parseFloat(c.price) || 0;
    return p > mx ? p : mx;
  }, 5000000);

  // ── Load from JSON instead of API ────────────────────────────────────────
  useEffect(() => {
    const raw = Array.isArray(carsData) ? carsData : [carsData];
    const mapped = (raw as JsonCar[]).map((c, i) => mapJsonCarToApiCar(c, i));
    setAllCars(mapped);
    const makes = Array.from(
      new Set(mapped.map((c) => c.make).filter(Boolean)),
    ).sort();
    setAvailableMakes(makes);
    setMaxPrice(
      mapped.reduce((mx, c) => {
        const p = parseFloat(c.price) || 0;
        return p > mx ? p : mx;
      }, 5000000),
    );
    setLoading(false);
  }, []);

  // ── Client-side filtering ────────────────────────────────────────────────
  const filteredCars = allCars.filter((car) => {
    if (make && car.make?.toLowerCase() !== make.toLowerCase()) return false;
    const priceNum = parseFloat(car.price) || 0;
    if (priceNum > maxPrice) return false;
    if (fuels.length > 0) {
      const carFuel = (car.fuel_type || "").toLowerCase();
      if (!fuels.some((f) => f.toLowerCase() === carFuel)) return false;
    }
    if (transmissions.length > 0) {
      const carTx = (car.transmission || "").toLowerCase();
      if (!transmissions.some((t) => t.toLowerCase() === carTx)) return false;
    }
    return true;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortBy === "price-asc")
      return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
    if (sortBy === "price-desc")
      return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
    if (sortBy === "mileage") return (a.km_driven || 0) - (b.km_driven || 0);
    return parseYear(b.make_year) - parseYear(a.make_year);
  });

  const totalPages = Math.ceil(sortedCars.length / CARS_PER_PAGE);
  const pageCars = sortedCars.slice(
    (currentPage - 1) * CARS_PER_PAGE,
    currentPage * CARS_PER_PAGE,
  );

  const toggleArr = (
    arr: string[],
    setArr: (a: string[]) => void,
    val: string,
  ) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setMake("");
    setMaxPrice(dataMaxPrice || 5000000);
    setFuels([]);
    setTransmissions([]);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasFilters = !!(
    make ||
    fuels.length ||
    transmissions.length ||
    maxPrice < (dataMaxPrice || 5000000)
  );

  const priceLabel =
    maxPrice >= 10000000
      ? `${(maxPrice / 10000000).toFixed(1)} Cr`
      : maxPrice >= 100000
        ? `${(maxPrice / 100000).toFixed(0)} L`
        : formatINRs(maxPrice);

  // ── JSX (identical to original — no changes below) ───────────────────────
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div
            className="section-badge"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,.7)",
              borderColor: "rgba(255,255,255,.1)",
              marginBottom: "1rem",
            }}
          >
            Our Inventory
          </div>
          <h1 className="page-hero-title">Browse Our Cars</h1>
          <p className="page-hero-sub">
            {loading
              ? "Loading inventory..."
              : `${allCars.length.toLocaleString()} certified pre-owned vehicles — filtered and ready for you.`}
          </p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          <div className="cars-layout">
            <aside className="filters-panel">
              <div className="filters-title">
                Filters
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    style={{
                      fontSize: ".8rem",
                      color: "var(--blue)",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="filter-group">
                <label className="filter-label">Make</label>
                <select
                  className="filter-select"
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Makes</option>
                  {availableMakes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Max Price:{" "}
                  <strong style={{ color: "var(--blue)" }}>
                    {hasFilters || maxPrice < (dataMaxPrice || 5000000)
                      ? `Rs. ${priceLabel}`
                      : "Any"}
                  </strong>
                </label>
                <input
                  type="range"
                  className="range-slider"
                  min={300000}
                  max={dataMaxPrice || 5000000}
                  step={100000}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                />
                <div className="price-range-labels">
                  <span>Rs. 3L</span>
                  <span>
                    {dataMaxPrice >= 10000000
                      ? `Rs. ${(dataMaxPrice / 10000000).toFixed(0)}Cr`
                      : `Rs. ${Math.round(dataMaxPrice / 100000)}L`}
                  </span>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Fuel Type</label>
                <div className="checkbox-group">
                  {[
                    { label: "Petrol", value: "petrol" },
                    { label: "Diesel", value: "diesel" },
                    { label: "Hybrid", value: "hybrid" },
                    { label: "Electric (EV)", value: "electric" },
                    { label: "CNG", value: "cng" },
                  ].map(({ label, value }) => (
                    <label key={value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={fuels.includes(value)}
                        onChange={() => toggleArr(fuels, setFuels, value)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Transmission</label>
                <div className="checkbox-group">
                  {[
                    { label: "Automatic", value: "automatic" },
                    { label: "Manual", value: "manual" },
                  ].map(({ label, value }) => (
                    <label key={value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={transmissions.includes(value)}
                        onChange={() =>
                          toggleArr(transmissions, setTransmissions, value)
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: 10,
                    background: "rgba(67,97,238,0.1)",
                    border: "1px solid rgba(67,97,238,0.2)",
                    fontSize: "0.8rem",
                    color: "var(--blue)",
                    fontWeight: 600,
                  }}
                >
                  {sortedCars.length} of {allCars.length} cars match
                </div>
              )}
            </aside>

            <div>
              <div className="sort-bar">
                <div className="results-count">
                  {loading ? (
                    "Loading..."
                  ) : (
                    <>
                      Showing <strong>{pageCars.length}</strong> of{" "}
                      <strong>{sortedCars.length}</strong> cars
                    </>
                  )}
                </div>
                <div className="sort-options">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="mileage">Lowest KM Driven</option>
                    <option value="year">Year: Newest</option>
                  </select>
                  <div className="view-toggle">
                    <button
                      className={`view-btn${viewMode === "grid" ? " active" : ""}`}
                      onClick={() => setViewMode("grid")}
                    >
                      Grid
                    </button>
                    <button
                      className={`view-btn${viewMode === "list" ? " active" : ""}`}
                      onClick={() => setViewMode("list")}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="cars-grid">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="car-card"
                      style={{
                        opacity: 0.4,
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    >
                      <div
                        style={{
                          height: 200,
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: 12,
                        }}
                      />
                      <div style={{ padding: "1rem" }}>
                        <div
                          style={{
                            height: 14,
                            background: "rgba(255,255,255,0.07)",
                            borderRadius: 6,
                            marginBottom: "0.5rem",
                            width: "60%",
                          }}
                        />
                        <div
                          style={{
                            height: 18,
                            background: "rgba(255,255,255,0.07)",
                            borderRadius: 6,
                            width: "80%",
                          }}
                        />
                      </div>
                      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.2} }`}</style>
                    </div>
                  ))}
                </div>
              )}

              {!loading && sortedCars.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                    🔍
                  </div>
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      marginBottom: ".5rem",
                    }}
                  >
                    No Cars Found
                  </h3>
                  <p
                    style={{
                      color: "var(--text-light)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    No cars match the selected filters. Try adjusting them.
                  </p>
                  {hasFilters && (
                    <button className="btn btn-primary" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {!loading && pageCars.length > 0 && (
                <div
                  className="cars-grid"
                  style={
                    viewMode === "list" ? { gridTemplateColumns: "1fr" } : {}
                  }
                >
                  {pageCars.map((car) => (
                    <div
                      key={car.id || String(car.car_id)}
                      className="car-card"
                    >
                      <div className="car-card-image">
                        <img
                          src={car.bg_removed_img || car.thumbnails}
                          alt={`${car.make_year} ${car.make} ${car.model}`}
                          loading="lazy"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            if (el.src !== car.thumbnails)
                              el.src = car.thumbnails;
                          }}
                        />
                        <div className="img-overlay" />
                        {car.city && (
                          <div className="car-badge-overlay">
                            <span className="car-badge badge-certified">
                              {car.city}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="car-card-body">
                        <div className="car-category-label">
                          {capitalize(car.body_type || "")}
                        </div>
                        <div className="car-make-model">
                          {car.make} {car.model}
                        </div>
                        <div className="car-specs-row">
                          <div className="car-spec-pill">
                            <span>
                              {(car.fuel_type || "").toLowerCase() ===
                              "electric"
                                ? "EV"
                                : "fuel"}
                            </span>
                            {capitalize(car.fuel_type || "")}
                          </div>
                          <div className="car-spec-pill">
                            <span>tx</span>
                            {capitalize(car.transmission || "")}
                          </div>
                          <div className="car-spec-pill">
                            <span>km</span>
                            {car.km_driven != null
                              ? `${Math.round(car.km_driven / 1000)}k km`
                              : "—"}
                          </div>
                        </div>
                        <div className="car-card-footer">
                          <div className="car-price">
                            {formatINRs(car.price)}
                          </div>
                          <div className="car-actions">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setModalCar(car)}
                            >
                              Details
                            </button>
                            <Link
                              href="/booking"
                              className="btn btn-primary btn-sm"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: ".5rem",
                    marginTop: "2.5rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === 1}
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: 9999,
                      border: "1.5px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-white)",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.4 : 1,
                    }}
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 2,
                    )
                    .map((p, idx, arr) => (
                      <span key={`page-${p}`} style={{ display: "contents" }}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span
                            style={{
                              padding: "0.4rem 0.5rem",
                              color: "var(--text-light)",
                            }}
                          >
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setCurrentPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            border: `1.5px solid ${p === currentPage ? "var(--blue)" : "var(--border)"}`,
                            background:
                              p === currentPage
                                ? "var(--blue)"
                                : "var(--bg-card)",
                            color:
                              p === currentPage ? "white" : "var(--text-white)",
                            fontSize: ".88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {p}
                        </button>
                      </span>
                    ))}

                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: 9999,
                      border: "1.5px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-white)",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.4 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {modalCar && (
        <CarModal car={modalCar} onClose={() => setModalCar(null)} />
      )}

      <footer>
        <div className="container">
          <div className="footer-bottom" style={{ justifyContent: "center" }}>
            <div>2026 AutoDrive. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
