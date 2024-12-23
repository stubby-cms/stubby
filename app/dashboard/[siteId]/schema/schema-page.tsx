"use client";

import { observer } from "@legendapp/state/react";
import { SchemaEditPage } from "./schema-edit";
import { SchemaList } from "./schema-list";
import { schemaActions, schemaStore$ } from "./state";
import { useEffect } from "react";

export const SchemaPage = observer(() => {
  const schemaId = schemaStore$.currentlyEditingSchemaId.get();

  useEffect(() => {
    return () => {
      schemaActions.currentlyEditingSchemaId(null);
    };
  }, []);

  return <div>{schemaId ? <SchemaEditPage /> : <SchemaList />}</div>;
});
