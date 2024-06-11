import { Formik, Form } from "formik";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { useAppSelector, useAppDispatch } from "_hooks";
import { changeActiveNetwork } from "_redux/slices/app";
import { API_ENV } from "_src/shared/api-env";
import { isValidUrl } from "_src/shared/utils";
import { InputWithAction } from "_src/ui/app/shared/InputWithAction";

const MIN_CHAR = 5;

const validation = Yup.object({
  rpcInput: Yup.string()
    .required()
    .label("Custom RPC URL")
    .min(MIN_CHAR)
    .test("validate-url", "Not a valid URL", (value) =>
      isValidUrl(value || null),
    ),
});

export function CustomRPCInput() {
  const placeholder = "";

  const customRPC = useAppSelector(({ app }) => app.fullNode ?? "");

  const dispatch = useAppDispatch();

  const changeNetwork = useCallback(
    async ({ rpcInput }: { rpcInput: string }) => {
      try {
        await dispatch(
          changeActiveNetwork({
            network: {
              env: API_ENV.customRPC,
              fullNode: rpcInput
            },
            store: true,
          }),
        ).unwrap();
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [dispatch],
  );

  return (
    <Formik
      initialValues={{ rpcInput: customRPC }}
      validationSchema={validation}
      onSubmit={changeNetwork}
      enableReinitialize={true}
    >
      <Form>
        <InputWithAction
          type="text"
          name="rpcInput"
          min={MIN_CHAR}
          actionDisabled="auto"
          placeholder={placeholder}
          actionText="Save"
        />
      </Form>
    </Formik>
  );
}
