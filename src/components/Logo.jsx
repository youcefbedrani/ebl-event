export default function Logo() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="-320 -320 640 640">
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 -8;0 0;0 8;0 0"
          keyTimes="0;0.25;0.5;0.75;1"
          calcMode="spline"
          keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
          dur="6s"
          repeatCount="indefinite"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;3 0;0 0;-3 0;0 0"
            keyTimes="0;0.25;0.5;0.75;1"
            calcMode="spline"
            keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
            dur="4s"
            repeatCount="indefinite"
          />
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 0 0;1.5 0 0;0 0 0;-1.5 0 0;0 0 0"
              keyTimes="0;0.25;0.5;0.75;1"
              calcMode="spline"
              keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
              dur="12s"
              repeatCount="indefinite"
            />
            <use href="#mark" />
          </g>
        </g>
      </g>
      <g transform="rotate(-72)">
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="12s" repeatCount="indefinite" />
          <g transform="translate(245 0)">
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;-360 0 0" dur="12s" repeatCount="indefinite" />
              <g transform="rotate(72)"><use href="#dotOrange" /></g>
            </g>
          </g>
        </g>
      </g>
      <g transform="rotate(108)">
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="12s" repeatCount="indefinite" />
          <g transform="translate(245 0)">
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 0 0;-360 0 0" dur="12s" repeatCount="indefinite" />
              <g transform="rotate(-108)"><use href="#dotNavy" /></g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
