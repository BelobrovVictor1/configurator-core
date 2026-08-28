import type {
  PreviewResult,
} from "../preview/previewEngine";

type ProductPreviewProps = {
  preview: PreviewResult;
  isValid: boolean;
};

function calculateDisplaySize(
  preview: PreviewResult,
) {
  const maxWidth = 420;
  const maxHeight = 260;

  let width =
    maxWidth;

  let height =
    width /
    preview.aspectRatio;

  if (
    height >
    maxHeight
  ) {
    height =
      maxHeight;

    width =
      height *
      preview.aspectRatio;
  }

  return {
    width,
    height,
  };
}

function WindowPreview({
  preview,
}: {
  preview: PreviewResult;
}) {
  const size =
    calculateDisplaySize(
      preview,
    );

  return (
    <div
      className="window-preview"
      style={{
        width:
          `${size.width}px`,

        height:
          `${size.height}px`,

        borderColor:
          preview.primaryColor,
      }}
    >
      <div className="window-glass">
        <div className="window-reflection" />
      </div>

      <div
        className="window-handle"
        style={{
          backgroundColor:
            preview.primaryColor,
        }}
      />
    </div>
  );
}

function GatePreview({
  preview,
}: {
  preview: PreviewResult;
}) {
  const size =
    calculateDisplaySize(
      preview,
    );

  return (
    <div
      className="gate-preview"
      style={{
        width:
          `${size.width}px`,

        height:
          `${size.height}px`,

        borderColor:
          preview.primaryColor,
      }}
    >
      <div
        className="gate-panel"
        style={{
          backgroundColor:
            preview.primaryColor,
        }}
      >
        <div className="gate-slat" />
        <div className="gate-slat" />
        <div className="gate-slat" />
        <div className="gate-slat" />
        <div className="gate-slat" />
        <div className="gate-slat" />
        <div className="gate-slat" />
      </div>

      <div className="gate-post gate-post-left" />

      <div className="gate-post gate-post-right" />
    </div>
  );
}

function FencePreview({
  preview,
}: {
  preview: PreviewResult;
}) {
  const panels =
    Array.from({
      length: 6,
    });

  return (
    <div className="fence-preview">
      <div className="fence-ground" />

      <div className="fence-sections">
        {panels.map(
          (
            _,
            index,
          ) => (
            <div
              className="fence-section"
              key={index}
            >
              <div className="fence-post" />

              <div
                className="fence-panel"
                style={{
                  borderColor:
                    preview.primaryColor,
                }}
              >
                <div
                  className="fence-wire fence-wire-1"
                  style={{
                    backgroundColor:
                      preview.primaryColor,
                  }}
                />

                <div
                  className="fence-wire fence-wire-2"
                  style={{
                    backgroundColor:
                      preview.primaryColor,
                  }}
                />

                <div
                  className="fence-wire fence-wire-3"
                  style={{
                    backgroundColor:
                      preview.primaryColor,
                  }}
                />

                <div
                  className="fence-wire fence-wire-4"
                  style={{
                    backgroundColor:
                      preview.primaryColor,
                  }}
                />

                <div
                  className="fence-wire fence-wire-5"
                  style={{
                    backgroundColor:
                      preview.primaryColor,
                  }}
                />
              </div>
            </div>
          ),
        )}

        <div className="fence-post fence-post-last" />
      </div>
    </div>
  );
}

function ProductPreview({
  preview,
  isValid,
}: ProductPreviewProps) {
  return (
    <section className="preview-card">
      <div className="preview-card-header">
        <div>
          <h2>
            Previzualizare
          </h2>

          <p>
            Reprezentare orientativă
            a configurației.
          </p>
        </div>

        <div className="preview-dimensions">
          {preview.label}
        </div>
      </div>

      <div className="preview-stage">
        {!isValid ? (
          <div className="preview-invalid">
            Corectează configurația
            pentru previzualizare.
          </div>
        ) : preview.renderer ===
          "window-basic" ? (
          <WindowPreview
            preview={preview}
          />
        ) : preview.renderer ===
          "gate-basic" ? (
          <GatePreview
            preview={preview}
          />
        ) : preview.renderer ===
          "fence-basic" ? (
          <FencePreview
            preview={preview}
          />
        ) : (
          <div className="preview-invalid">
            Previzualizarea nu este
            disponibilă.
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductPreview;