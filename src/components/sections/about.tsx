export function About() {
  return (
    <div className="mt-4">
      <ul className="flex flex-col gap-1 text-sm list-disc list-inside">
        <li>
          ML Engineer with 3+ years of experience delivering production-grade ML
          and LLM systems
        </li>
        <li>
          <span className="border-b border-dashed border-accent-pop/60 select-all">
            Python
          </span>
          ,{" "}
          <span className="border-b border-dashed border-accent-pop/60 select-all">
            FastAPI
          </span>
          , and{" "}
          <span className="border-b border-dashed border-accent-pop/60 select-all">
            PySpark
          </span>{" "}
          are my go-to for scalable pipelines and model serving
        </li>
        <li>
          I work with{" "}
          <span className="border-b border-dashed border-accent-pop/60 select-all">
            LangChain
          </span>
          ,{" "}
          <span className="border-b border-dashed border-accent-pop/60 select-all">
            HuggingFace
          </span>
          , and{" "}
          <span className="border-b border-dashed border-accent-pop/60 select-all">
            MLflow
          </span>{" "}
          for reproducible, high-performance AI deployments
        </li>
      </ul>
    </div>
  );
}
