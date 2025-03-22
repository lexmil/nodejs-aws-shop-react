import React from "react";
import axios, { AxiosError } from "axios";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useMutation } from "react-query";

type CSVFileImportProps = {
  url: string;
  title: string;
};

interface Headers {
  Authorization: string;
}

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | undefined>();

  const TOKEN = localStorage.getItem("authorization_token");

  const headers: Partial<Headers> = {};

  if (TOKEN) headers.Authorization = `Basic ${TOKEN}`;

  const { mutateAsync } = useMutation<
    string,
    AxiosError,
    { url: string; fileName: string }
  >(async ({ url, fileName }: { url: string; fileName: string }) => {
    return axios
      .get(url, {
        params: { name: fileName },
        headers,
      })
      .then(({ data }) => {
        console.log("Authorization: OK");

        return data;
      })
      .catch(({ response }) => {
        let message = "";

        switch (response?.status) {
          case 401:
            message = "401 Unauthorized";
            break;
          case 403:
            message = "403 Forbidden";
            break;
          default:
            message = "Unknown error";
        }

        window.dispatchEvent(
          new CustomEvent("show-alert", {
            detail: { message, severity: "error" },
          })
        );
      });
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    if (!file) {
      console.error("uploaded file is absent");
      return;
    }

    try {
      const mutateAsyncUrl = await mutateAsync({
        url,
        fileName: encodeURIComponent(file?.name || ""),
      });

      console.log("File to upload: ", file?.name);
      console.log("Uploading to: ", mutateAsyncUrl);

      const result = await fetch(mutateAsyncUrl, {
        method: "PUT",
        body: file,
      });

      console.log("Uploading complete: ", result);

      setFile(undefined);
    } catch (error) {
      console.error("Uploading error: ", error);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
