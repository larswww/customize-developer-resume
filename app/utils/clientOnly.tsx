import { useHydrated } from "./use-hydrated";

type Props = {
	children(): React.ReactNode;
	fallback?: React.ReactNode;
};

export function ClientOnly({ children, fallback = null }: Props) {
	return useHydrated() ? <>{children()}</> : <>{fallback}</>;
}
