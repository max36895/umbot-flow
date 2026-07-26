import HelpButton from '../../ui/HelpButton';

interface FieldProps {
    label: string;
    children: React.ReactNode;
    help?: string;
}

/** Общая обёртка для полей свойств с меткой и опциональной подсказкой. */
export function Field({ label, children, help }: FieldProps) {
    return (
        <div className="mb-5">
            <div className="mb-1.5 flex items-center gap-1">
                <label className="text-xs font-medium text-white/75">{label}</label>
                {help && <HelpButton content={help} />}
            </div>
            {children}
        </div>
    );
}
