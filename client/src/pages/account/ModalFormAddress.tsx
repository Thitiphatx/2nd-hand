import { Form, Input, Modal, Select } from 'antd';
import type { FormInstance } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { getDataForZipCode, getAllData } from 'thai-data';

interface IModalFormAddressProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    isEdit: boolean;
    form: FormInstance;
}

const ModalFormAddress: React.FC<IModalFormAddressProps> = ({
    open,
    onCancel,
    onSubmit,
    isEdit,
    form
}) => {
    const [subDistricts, setSubDistricts] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [provinces, setProvinces] = useState<string[]>([]);

    const handleZipcodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length === 5) {
            const data = getDataForZipCode(value);
            if (data) {
                const sNames = data.subDistrictList?.map(s => s.subDistrictName) || [];
                const dNames = data.districtList?.map(d => d.districtName) || [];
                const pNames = data.provinceList?.map(p => p.provinceName) || [];

                setSubDistricts(sNames);
                setDistricts(dNames);
                setProvinces(pNames);

                // Auto-select if only one option, else clear
                form.setFieldsValue({
                    subDistrict: sNames.length === 1 ? sNames[0] : undefined,
                    district: dNames.length === 1 ? dNames[0] : undefined,
                    province: pNames.length === 1 ? pNames[0] : undefined,
                });
            } else {
                const allData = getAllData();
                const allProvinces = Array.from(
                    new Set(allData.flatMap(item => item.provinceList?.map(p => p.provinceName) || []))
                ).sort((a, b) => a.localeCompare(b, 'th'));

                setProvinces(allProvinces);
                setDistricts([]);
                setSubDistricts([]);
                form.setFieldsValue({
                    subDistrict: undefined,
                    district: undefined,
                    province: undefined,
                });
            }
        } else {
            const allData = getAllData();
            const allProvinces = Array.from(
                new Set(allData.flatMap(item => item.provinceList?.map(p => p.provinceName) || []))
            ).sort((a, b) => a.localeCompare(b, 'th'));

            setProvinces(allProvinces);
            setDistricts([]);
            setSubDistricts([]);
            form.setFieldsValue({
                subDistrict: undefined,
                district: undefined,
                province: undefined,
            });
        }
    }, [form]);

    const handleProvinceChange = useCallback((value: string) => {
        form.setFieldsValue({
            district: undefined,
            subDistrict: undefined,
        });

        const allData = getAllData();
        const provinceDistricts = allData
            .filter(item => item.provinceList?.some(p => p.provinceName === value) || false)
            .flatMap(item => item.districtList?.map(d => d.districtName) || []);
        
        const uniqueDistricts = Array.from(new Set(provinceDistricts)).sort();
        setDistricts(uniqueDistricts);
        setSubDistricts([]);
    }, [form]);

    const handleDistrictChange = useCallback((value: string) => {
        form.setFieldsValue({
            subDistrict: undefined,
        });

        const allData = getAllData();
        const districtSubDistricts = allData
            .filter(item => item.districtList?.some(d => d.districtName === value) || false)
            .flatMap(item => item.subDistrictList?.map(s => s.subDistrictName) || []);
        
        const uniqueSubDistricts = Array.from(new Set(districtSubDistricts)).sort();
        setSubDistricts(uniqueSubDistricts);
    }, [form]);

    // Load initial options if editing
    useEffect(() => {
        if (open) {
            const zipcode = form.getFieldValue('zipcode');
            if (zipcode && zipcode.length === 5) {
                const data = getDataForZipCode(zipcode);
                if (data) {
                    setSubDistricts(data.subDistrictList?.map(s => s.subDistrictName) || []);
                    setDistricts(data.districtList?.map(d => d.districtName) || []);
                    setProvinces(data.provinceList?.map(p => p.provinceName) || []);
                    return;
                }
            }

            const allData = getAllData();
            const allProvinces = Array.from(
                new Set(allData.flatMap(item => item.provinceList?.map(p => p.provinceName) || []))
            ).sort((a, b) => a.localeCompare(b, 'th'));

            setProvinces(allProvinces);
            setDistricts([]);
            setSubDistricts([]);
        }
    }, [open, isEdit, form]);

    // Reset form and state when modal closes
    useEffect(() => {
        if (!open) {
            setSubDistricts([]);
            setDistricts([]);
            setProvinces([]);
        }
    }, [open]);

    return (
        <Modal
            title={isEdit ? 'Edit Address' : 'Add New Address'}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            destroyOnHidden
            width={600}
            okText={isEdit ? 'Save Changes' : 'Add Address'}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                className="mt-4"
                requiredMark="optional"
            >
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item
                        label="Address Label"
                        name="title"
                        rules={[
                            { pattern: /^[a-zA-Z0-9ก-๙\s]+$/, message: 'Only letters, numbers, and spaces are allowed' },
                            { max: 60, message: 'Address label cannot exceed 60 characters' }
                        ]}
                        className="col-span-2"
                    >
                        <Input placeholder="e.g. Home, Office, Condo" />
                    </Form.Item>
                    <Form.Item
                        label="Receiver's Name"
                        name="receiverName"
                        rules={[
                            { required: true, message: 'Please enter receiver\'s name' },
                            { pattern: /^[a-zA-Zก-๙\s]+$/, message: 'Only letters and spaces are allowed (no numbers or special characters)' },
                            { max: 255, message: 'Receiver\'s name cannot exceed 255 characters' }
                        ]}
                    >
                        <Input placeholder="e.g. Somchai Rakdee" />
                    </Form.Item>
                    <Form.Item
                        label="Phone Number"
                        name="phone"
                        rules={[
                            { required: true, message: 'Please enter phone number' },
                            { pattern: /^[0-9]+$/, message: 'Only numbers are allowed' },
                            { min: 9, message: 'Phone number must be at least 9 digits' },
                            { max: 11, message: 'Phone number cannot exceed 11 digits' }
                        ]}
                    >
                        <Input placeholder="e.g. 0891234567" />
                    </Form.Item>

                    <Form.Item
                        label="Postal Code"
                        name="zipcode"
                        rules={[{ required: true, len: 5, message: 'Please enter 5-digit postal code' }]}
                    >
                        <Input onChange={handleZipcodeChange} maxLength={5} placeholder="e.g. 10110" />
                    </Form.Item>

                    <Form.Item
                        label="Province"
                        name="province"
                        rules={[{ required: true, message: 'Please select province' }]}
                    >
                        <Select
                            options={provinces.map(p => ({ label: p, value: p }))}
                            disabled={provinces.length === 0}
                            placeholder="Select province"
                            showSearch
                            onChange={handleProvinceChange}
                        />
                    </Form.Item>
                    <Form.Item
                        label="District (Amphoe / Khet)"
                        name="district"
                        rules={[{ required: true, message: 'Please select district' }]}
                    >
                        <Select
                            options={districts.map(d => ({ label: d, value: d }))}
                            disabled={districts.length === 0}
                            placeholder={districts.length === 0 ? "Select province first" : "Select district"}
                            showSearch
                            onChange={handleDistrictChange}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Sub-district (Tambon / Khwaeng)"
                        name="subDistrict"
                        rules={[{ required: true, message: 'Please select sub-district' }]}
                    >
                        <Select
                            options={subDistricts.map(s => ({ label: s, value: s }))}
                            disabled={subDistricts.length === 0}
                            placeholder={subDistricts.length === 0 ? "Select district first" : "Select sub-district"}
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item
                        label="Address Detail"
                        name="address"
                        rules={[
                            { required: true, message: 'Please enter address details' },
                            { pattern: /^[a-zA-Z0-9ก-๙\s/\-.,()#]+$/, message: 'Only letters, numbers, spaces, and standard address symbols are allowed' },
                            { max: 255, message: 'Address detail cannot exceed 255 characters' }
                        ]}
                        className="col-span-2"
                    >
                        <Input.TextArea rows={3} placeholder="House No., Building, Soi, Road, etc." />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default ModalFormAddress;
