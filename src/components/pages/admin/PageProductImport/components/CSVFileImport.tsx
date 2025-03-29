import React from "react";
import axios, { AxiosError } from "axios";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useMutation } from "react-query";

interface CSVFileImportProps {
  url: string;
  title: string;
}

interface MutationProps {
  url: string;
  name: string;
}

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | undefined>();

  const { mutateAsync } = useMutation<string, AxiosError, MutationProps>(
    async ({ url, name }: MutationProps) => {
      return axios
        .get(url, {
          params: { name },
          headers: {
            // You have to store localStorage key authorization_token that equals YWRtaW46YWRtaW4=
            Authorization: `Basic ${localStorage.getItem(
              "authorization_token"
            )}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ response }) => {
          let message = "";

          switch (response?.status) {
            case 401:
              message = "401 Unauthorized - Invalid credentials";
              break;
            case 403:
              message = "403 Forbidden - Insufficient permissions";
              break;
            case 400:
              message = "400 Bad Request - Invalid request parameters";
              break;
            default:
              message = "Unknown error occurred";
          }

          window.dispatchEvent(
            new CustomEvent("show-alert", {
              detail: { message, severity: "error" },
            })
          );
        });
    }
  );

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
        name: encodeURIComponent(file?.name || ""),
      });

      console.log("File to upload: ", file?.name);

      if (!mutateAsyncUrl) {
        console.error("Uploading error: no URL");
        return;
      }

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
