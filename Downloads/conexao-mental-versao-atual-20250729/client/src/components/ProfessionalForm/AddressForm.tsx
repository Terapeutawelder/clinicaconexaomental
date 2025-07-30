
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AddressData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressFormProps {
  formData: AddressData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressForm = ({ formData, onInputChange }: AddressFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={onInputChange}
            placeholder="Rua, número, bairro"
          />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={onInputChange}
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={onInputChange}
          />
        </div>
        <div>
          <Label htmlFor="zipCode">CEP</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={onInputChange}
            placeholder="00000-000"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
