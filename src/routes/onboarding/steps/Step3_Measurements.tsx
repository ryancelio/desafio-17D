import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnboarding } from "../../../context/OnboardingContext";
import { ReactSVG } from "react-svg";
import {
  step3MeasurementValidationSchema,
  type IMeasurementsData,
} from "../../../types/onboarding.schema";

import maleBody from "../../../assets/body-male.svg";
import { LuCircleAlert } from "react-icons/lu";
// import femaleBody from "../../../assets/body-female-tagged.svg";

type MeasurementField = keyof IMeasurementsData;

export default function Step3_Measurements() {
  const { onboardingData, updateOnboardingData, setStepValid } =
    useOnboarding();

  const { measurements } = onboardingData; // Lê direto do contexto

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [highlightedPart, setHighlightedPart] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // const genero = onboardingData.personal.genero;
  const bodyImage = maleBody; //genero === "feminino" ? femaleBody : maleBody;

  useEffect(() => {
    const result = step3MeasurementValidationSchema.safeParse(measurements);
    setStepValid(result.success);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        peso_kg: fieldErrors.peso_kg?.[0],
        cintura_cm: fieldErrors.cintura_cm?.[0],
        quadril_cm: fieldErrors.quadril_cm?.[0],
        braco_cm: fieldErrors.braco_cm?.[0],
        coxa_cm: fieldErrors.coxa_cm?.[0],
      });
    } else {
      setErrors({});
    }
  }, [measurements, setStepValid]);

  // 6. ATUALIZADO: Escreve direto no contexto e valida a entrada
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Permite apenas strings vazias, números, ou um único ponto decimal
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      updateOnboardingData({
        measurements: {
          ...measurements,
          [name]: value,
        },
      });
    }
  };

  // 7. ADICIONADO: Handlers de 'blur' e 'renderError'
  const handleBlur = (field: MeasurementField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const renderError = (field: MeasurementField) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <AnimatePresence>
        <motion.p
          className="flex items-center gap-1 text-sm text-red-600 mt-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <LuCircleAlert className="w-4 h-4" />
          {errors[field]}
        </motion.p>
      </AnimatePresence>
    );
  };

  const bodyParts = [
    { label: "Peso (kg)", name: "peso_kg", zone: "body" },
    { label: "Braço (cm)", name: "braco_cm", zone: "arm" },
    { label: "Cintura (cm)", name: "cintura_cm", zone: "waist" },
    { label: "Quadril (cm)", name: "quadril_cm", zone: "hips" },
    { label: "Coxa (cm)", name: "coxa_cm", zone: "thigh" },
  ];

  /**
   * Recalculate overlay positions/sizes based on the main path bbox.
   * This makes the overlay ellipses align with the actual artwork regardless of viewBox/scale.
   */
  const layoutOverlays = (svg: SVGSVGElement) => {
    // find the main path (your single continuous body shape)
    const mainPath = svg.querySelector("path");
    if (!mainPath) return;

    // ensure we can measure
    let bbox: DOMRect;
    try {
      bbox = (mainPath as SVGGraphicsElement).getBBox();
    } catch {
      // if getBBox fails, fallback to viewBox dimensions
      const vb = svg.viewBox.baseVal;
      bbox = new DOMRect(vb.x, vb.y, vb.width, vb.height);
    }

    const cx = bbox.x + bbox.width / 2;
    // positions based on proportional offsets from the bbox:
    const armLeftX = bbox.x + bbox.width * 0.2;
    const armRightX = bbox.x + bbox.width * 0.8;
    const armY = bbox.y + bbox.height * 0.28;
    const armRx = bbox.width * 0.1;
    const armRy = bbox.height * 0.18;

    const waistCx = cx;
    const waistCy = bbox.y + bbox.height * 0.44;
    const waistRx = bbox.width * 0.18;
    const waistRy = bbox.height * 0.08;

    const hipsCx = cx;
    const hipsCy = bbox.y + bbox.height * 0.58;
    const hipsRx = bbox.width * 0.22;
    const hipsRy = bbox.height * 0.12;

    const thighCx = cx;
    const thighCy = bbox.y + bbox.height * 0.8;
    const thighRx = bbox.width * 0.12;
    const thighRy = bbox.height * 0.2;

    const bodyCx = cx;
    const bodyCy = bbox.y + bbox.height * 0.45;
    const bodyRx = bbox.width * 0.28;
    const bodyRy = bbox.height * 0.52;

    // Apply values to overlay shapes (ellipses) inside each [data-zone] group.
    const setEllipseAttrs = (
      el: Element | null,
      attrs: Record<string, number>
    ) => {
      if (!el) return;
      const ellipse = (el as SVGElement).querySelector("ellipse");
      if (!ellipse) return;
      Object.entries(attrs).forEach(([k, v]) =>
        ellipse.setAttribute(k, String(v))
      );
    };

    // Arms group likely contains two ellipses - we update each by order
    const armGroup = svg.querySelector('[data-zone="arm"]');
    if (armGroup) {
      const ellipses = Array.from(armGroup.querySelectorAll("ellipse"));
      if (ellipses.length >= 2) {
        // left
        ellipses[0].setAttribute("cx", String(armLeftX));
        ellipses[0].setAttribute("cy", String(armY));
        ellipses[0].setAttribute("rx", String(armRx));
        ellipses[0].setAttribute("ry", String(armRy));
        // right
        ellipses[1].setAttribute("cx", String(armRightX));
        ellipses[1].setAttribute("cy", String(armY));
        ellipses[1].setAttribute("rx", String(armRx));
        ellipses[1].setAttribute("ry", String(armRy));
      } else {
        // fallback: single ellipse covering both arms
        setEllipseAttrs(armGroup, {
          cx: cx,
          cy: armY,
          rx: armRx * 2,
          ry: armRy,
        });
      }
    }

    setEllipseAttrs(svg.querySelector('[data-zone="waist"]'), {
      cx: waistCx,
      cy: waistCy,
      rx: waistRx,
      ry: waistRy,
    });

    setEllipseAttrs(svg.querySelector('[data-zone="hips"]'), {
      cx: hipsCx,
      cy: hipsCy,
      rx: hipsRx,
      ry: hipsRy,
    });

    setEllipseAttrs(svg.querySelector('[data-zone="thigh"]'), {
      cx: thighCx,
      cy: thighCy,
      rx: thighRx,
      ry: thighRy,
    });

    setEllipseAttrs(svg.querySelector('[data-zone="body"]'), {
      cx: bodyCx,
      cy: bodyCy,
      rx: bodyRx,
      ry: bodyRy,
    });
  };

  const handleSVGReady = (svg: SVGSVGElement) => {
    // center & scale behavior
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svgRef.current = svg;

    // First remove any previous active flags:
    svg
      .querySelectorAll("[data-zone]")
      .forEach((el) => el.removeAttribute("data-active"));

    // Layout overlays to match the main path bbox
    // Use a tiny timeout to ensure the svg internals are ready when needed in some browsers.
    // Usually getBBox() works immediately, but the small timeout increases robustness.
    setTimeout(() => layoutOverlays(svg), 0);

    // Apply highlight (if currently focused)
    if (highlightedPart) {
      const active = svg.querySelector(`[data-zone="${highlightedPart}"]`);
      if (active) active.setAttribute("data-active", "true");
    }
  };

  // When highlightedPart changes (focus/blur) update the injected svg
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg
      .querySelectorAll("[data-zone]")
      .forEach((el) => el.removeAttribute("data-active"));
    if (highlightedPart) {
      const active = svg.querySelector(`[data-zone="${highlightedPart}"]`);
      if (active) active.setAttribute("data-active", "true");
    }
  }, [highlightedPart]);

  useEffect(() => {
    const pesoValido = onboardingData.measurements.peso_kg !== "";

    setStepValid(pesoValido);
  }, [onboardingData.measurements, setStepValid]);

  // If the gender changes, we should re-layout overlays when the new SVG is injected.
  // ReactSVG will call beforeInjection again for the new src.

  return (
    <div className="grid md:grid-cols-2 gap-10 items-center">
      {/* --- Form --- */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-800">
          Suas Medidas Iniciais
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Insira suas medidas atuais para acompanharmos sua evolução.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {bodyParts.map((part) => (
            <motion.div
              key={part.name}
              whileHover={{ scale: 1.02 }}
              className={
                "flex flex-col " +
                `${
                  part.name === "peso_kg"
                    ? "place-self-start col-span-2 w-fit"
                    : ""
                }`
              }
            >
              <label
                htmlFor={part.name}
                className="text-gray-700 font-medium mb-1"
              >
                {part.label}
                {part.name === "peso_kg" ? (
                  <span className="text-red-500"> *</span>
                ) : (
                  <></>
                )}
              </label>
              <input
                type="text"
                inputMode="decimal"
                id={part.name}
                name={part.name}
                value={measurements[part.name as keyof IMeasurementsData]}
                onChange={handleInputChange}
                onFocus={() => setHighlightedPart(part.zone)}
                onBlur={() => {
                  setHighlightedPart(null);
                  handleBlur(part.name as keyof IMeasurementsData);
                }}
                className={`w-full p-2 border rounded-lg focus:outline-none ${
                  touched[part.name] && errors[part.name]
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 focus:ring-2 focus:ring-[#A8F3DC]"
                }`}
                placeholder="0"
              />
              {renderError(part.name as keyof IMeasurementsData)}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* --- Interactive body --- */}
      <motion.div
        className="relative flex justify-center items-center w-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <motion.div
          className="relative w-64 h-[500px] flex items-center justify-center"
          animate={
            highlightedPart
              ? {
                  scale:
                    highlightedPart === "arm"
                      ? 1.22
                      : highlightedPart === "waist"
                      ? 1.3
                      : highlightedPart === "hips"
                      ? 1.26
                      : highlightedPart === "thigh"
                      ? 1.26
                      : 1.12,
                  y:
                    highlightedPart === "arm"
                      ? -30
                      : highlightedPart === "waist"
                      ? -8
                      : highlightedPart === "hips"
                      ? 12
                      : highlightedPart === "thigh"
                      ? 36
                      : 0,
                }
              : { scale: 1, y: 0 }
          }
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
        >
          <div className="w-full h-full grid place-items-center">
            <ReactSVG
              src={bodyImage}
              beforeInjection={(svg: SVGSVGElement) => handleSVGReady(svg)}
              // ensure the outer wrapper doesn't add extra styles
              fallback={() => <div className="w-full h-full" />}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
