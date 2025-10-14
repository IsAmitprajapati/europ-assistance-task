import {
    Box,
    Button,
    IconButton,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText,
} from "@mui/material";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import api from "../../../utils/Axios";
import { endpoints } from "../../../utils/endpoint";
import type { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// API endpoints
const API_CREATE = endpoints.customer; // POST
const API_UPDATE = (id: string) => `/${endpoints.customer}/${id}`; // PUT

interface ICreateUpdateCustomer {
    customerId?: string;
}

type SegmentRow = {
    _id: string;
    name: string;
    customers?: [];
    updatedAt: string;
};

interface LocationFields {
    city: string;
    state: string;
    country: string;
}

interface IFormFields {
    name: string;
    email: string;
    phone: string;
    age: string;
    location: LocationFields;
    segment: string[];
    tag: string[];
    status: string;
    engagement_score: string;
    lifecycle_stage: string;
    payment_behavior: string;
}

const initialFormState: IFormFields = {
    name: "",
    email: "",
    phone: "",
    age: "",
    location: {
        city: "",
        state: "",
        country: "",
    },
    segment: [],
    tag: [],
    status: "",
    engagement_score: "",
    lifecycle_stage: "",
    payment_behavior: "",
};

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 224,
            width: 250,
        },
    },
};

const TagsList = ["VIP", "High-Risk", "Loyal"];
const statusList = ["Active", "Inactive"];
const engagement_scoreList = ["High", "Medium", "At-Low"];
const lifecycle_stageList = ["Prospect", "Active", "At-Risk", "Churned"];
const payment_behaviorList = ["On-time", "Delayed"];

export default function CreateUpdateCustomer({ customerId }: ICreateUpdateCustomer) {
    const isUpdateCustomer: boolean = !!customerId;
    const [form, setForm] = useState<IFormFields>(initialFormState);
    const [errors, setErrors] = useState<Partial<IFormFields> & { location?: Partial<LocationFields> }>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const [segmentData, setSegmentData] = useState<SegmentRow[]>([]);

    // Fetch segments
    const fetchSegment = useCallback(async () => {
        try {
            const params = { limit: 1000 };
            const response = await api.get(endpoints.segment, { params });
            setSegmentData(response.data.data || []);
        } catch (err: any) {
            // Could put an error toast or error UI here
            // For now, just log
            console.error("Failed to fetch segments", err);
        }
    }, []);

    useEffect(() => {
        fetchSegment();
    }, [fetchSegment]);

    // Fetch customer details if updating
    //   useEffect(() => {
    //     if (isUpdateCustomer && customerId) {
    //       (async () => {
    //         try {
    //           const { data } = await api(API_UPDATE(customerId));

    //           setForm({
    //             name: data.name || "",
    //             email: data.email || "",
    //             phone: data.phone || "",
    //             age: data.age ? String(data.age) : "",
    //             location: {
    //               city: data.location?.city ?? "",
    //               state: data.location?.state ?? "",
    //               country: data.location?.country ?? "",
    //             },
    //             segment: Array.isArray(data.segment)
    //               ? data.segment.map((s: any) => (typeof s === "string" ? s : s._id ?? s.name))
    //               : [],
    //             tag: Array.isArray(data.tag) ? data.tag : [],
    //             status: data.status || "",
    //             engagement_score: data.engagement_score || "",
    //             lifecycle_stage: data.lifecycle_stage || "",
    //             payment_behavior: data.payment_behavior || "",
    //           });
    //         } catch (err) {
    //           // Could show error toast here
    //           // For now: ignore and leave form empty
    //         }
    //       })();
    //     }
    //   }, [customerId, isUpdateCustomer]);

    // --- Validation ---
    const validate = (f: IFormFields) => {
        let errs: Partial<IFormFields> & { location?: Partial<LocationFields> } = {};

        if (!f.name.trim()) errs.name = "Name is required";
        if (!f.email.trim()) {
            errs.email = "Email is required";
        } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(f.email.trim())) {
            errs.email = "Email is invalid";
        }
        if (!f.phone.trim()) {
            errs.phone = "Phone is required";
        } else if (!/^\+?\d{7,15}$/.test(f.phone.trim())) {
            errs.phone = "Phone is invalid";
        }
        if (!f.age.trim()) {
            errs.age = "Age is required";
        } else if (isNaN(Number(f.age)) || Number(f.age) <= 0) {
            errs.age = "Provide a positive number";
        }

        errs.location = { city: "", state: "", country: "" };
        if (!f.location.country.trim()) (errs.location as Partial<LocationFields>).country = "Country is required";
        if (!f.location.state.trim()) (errs.location as Partial<LocationFields>).state = "State is required";
        if (!f.location.city.trim()) (errs.location as Partial<LocationFields>).city = "City is required";
        if (
            !errs.location ||
            Object.keys(errs.location).length === 0 ||
            !Object.values(errs.location).filter(Boolean).length
        ) {
            delete errs.location;
        }

        // Optionally, make status required
        // if (!f.status.trim()) errs.status = "Status is required";

        return errs;
    };

    // --- Handlers ---
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target;
        if (!name) return;
        if (["city", "state", "country"].includes(name)) {
            setForm((prev) => ({
                ...prev,
                location: {
                    ...prev.location,
                    [name]: value as string,
                },
            }));
            setErrors((prev) => ({
                ...prev,
                location: {
                    ...prev.location as { state: "", city: "", country: "" },
                    [name]: undefined,
                },
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value as string }));
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSelectChange =
        (field: keyof IFormFields) => (event: any) => {
            const { value } = event.target;
            setForm((prev) => ({
                ...prev,
                [field]: typeof value === "string" ? value.split(",") : value,
            }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        };

    const handleLocationSelectChange: any = handleChange;

    // Status etc. - reuse handleChange
    // For dropdowns with simple string values, MUI passes value as event.target.value

    // Optionally generic field handler
    const handleSimpleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
    }

    // --- Form Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validate(form);
        setErrors(validation);

        if (
            Object.keys(validation).length > 0 ||
            (validation.location && Object.values(validation.location).filter(Boolean).length > 0)
        )
            return;

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                age: Number(form.age),
                location: form.location,
                segmentIds: form.segment,
                tags: form.tag,
                status: form.status,
                engagement_score: form.engagement_score,
                lifecycle_stage: form.lifecycle_stage,
                payment_behavior: form.payment_behavior,
            };

            let res: AxiosResponse;

            if (isUpdateCustomer && customerId) {
                res = await api.put(`${endpoints.customer}/${customerId}`, payload)
            } else {
                res = await api.post(endpoints.customer,payload)
            }

            if (res?.data?.success) {
                navigate("/dashboard/customer")
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message)
            // setErrors({ name: err.message || "An error occurred" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                    onClick={() => window.history.back()}
                    color="primary"
                    sx={{
                        mr: 2,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "primary.lighter" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    aria-label="Go back"
                >
                    <IconArrowNarrowLeft />
                </IconButton>
                <Typography variant="h3" component="h2" sx={{ mb: 0 }} gutterBottom>
                    {isUpdateCustomer ? "Edit Customer" : "Create Customer"}
                </Typography>
            </Box>

            {/* Form */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                mt={6}
                width={{ xs: "100%" }}
                autoComplete="off"
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                }}
            >
                {/* NAME */}
                <TextField
                    label="Name"
                    size="medium"
                    variant="outlined"
                    required
                    fullWidth
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    autoFocus
                />

                {/* EMAIL */}
                <TextField
                    label="Email"
                    size="medium"
                    variant="outlined"
                    required
                    fullWidth
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    type="email"
                    inputProps={{ autoComplete: "email" }}
                />

                {/* PHONE */}
                <TextField
                    label="Phone"
                    size="medium"
                    variant="outlined"
                    required
                    fullWidth
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone}
                    type="tel"
                    inputProps={{ autoComplete: "tel" }}
                />

                {/* AGE */}
                <TextField
                    label="Age"
                    size="medium"
                    variant="outlined"
                    required
                    fullWidth
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    error={Boolean(errors.age)}
                    helperText={errors.age}
                    type="number"
                    inputProps={{ min: 1 }}
                />

                {/* COUNTRY */}
                <FormControl fullWidth error={Boolean(errors.location && errors.location.country)}>
                    <InputLabel id="country-label">Country</InputLabel>
                    <Select
                        labelId="country-label"
                        id="country-select"
                        value={form.location.country}
                        label="Country"
                        name="country"
                        onChange={handleLocationSelectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value="India">India</MenuItem>
                        <MenuItem value="United States">United States</MenuItem>
                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                        <MenuItem value="Canada">Canada</MenuItem>
                        <MenuItem value="Australia">Australia</MenuItem>
                    </Select>
                    {errors.location && errors.location.country && (
                        <Typography color="error" variant="caption">
                            {errors.location.country}
                        </Typography>
                    )}
                </FormControl>

                {/* STATE */}
                <FormControl fullWidth error={Boolean(errors.location && errors.location.state)}>
                    <InputLabel id="state-label">State</InputLabel>
                    <Select
                        labelId="state-label"
                        id="state-select"
                        value={form.location.state}
                        label="State"
                        name="state"
                        onChange={handleLocationSelectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                        <MenuItem value="California">California</MenuItem>
                        <MenuItem value="New South Wales">New South Wales</MenuItem>
                        <MenuItem value="Ontario">Ontario</MenuItem>
                        <MenuItem value="England">England</MenuItem>
                    </Select>
                    {errors.location && errors.location.state && (
                        <Typography color="error" variant="caption">
                            {errors.location.state}
                        </Typography>
                    )}
                </FormControl>

                {/* CITY */}
                <FormControl fullWidth error={Boolean(errors.location && errors.location.city)}>
                    <InputLabel id="city-label">City</InputLabel>
                    <Select
                        labelId="city-label"
                        id="city-select"
                        value={form.location.city}
                        label="City"
                        name="city"
                        onChange={handleLocationSelectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value="Mumbai">Mumbai</MenuItem>
                        <MenuItem value="San Francisco">San Francisco</MenuItem>
                        <MenuItem value="Toronto">Toronto</MenuItem>
                        <MenuItem value="Sydney">Sydney</MenuItem>
                        <MenuItem value="London">London</MenuItem>
                    </Select>
                    {errors.location && errors.location.city && (
                        <Typography color="error" variant="caption">
                            {errors.location.city}
                        </Typography>
                    )}
                </FormControl>

                {/* SEGMENT */}
                <FormControl fullWidth>
                    <InputLabel id="segment-label">Segment</InputLabel>
                    <Select
                        labelId="segment-label"
                        id="segment"
                        multiple
                        value={form.segment}
                        onChange={handleSelectChange("segment")}
                        input={<OutlinedInput label="Segment" />}
                        renderValue={(selected: any) =>
                            segmentData
                                .filter((seg) => selected.includes(seg._id))
                                .map((seg) => seg.name)
                                .join(", ")
                        }
                        MenuProps={MenuProps}
                    >
                        {segmentData.map((seg) => (
                            <MenuItem key={seg._id} value={seg._id}>
                                <Checkbox checked={form.segment.includes(seg._id)} />
                                <ListItemText primary={seg.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* TAGS */}
                <FormControl fullWidth>
                    <InputLabel id="tag-label">Tag</InputLabel>
                    <Select
                        labelId="tag-label"
                        id="tag"
                        multiple
                        value={form.tag}
                        onChange={handleSelectChange("tag")}
                        input={<OutlinedInput label="Tag" />}
                        renderValue={(selected) => (selected as string[]).join(", ")}
                        MenuProps={MenuProps}
                    >
                        {TagsList.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                                <Checkbox checked={form.tag.includes(tag)} />
                                <ListItemText primary={tag} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* STATUS */}
                {/* <FormControl fullWidth error={!!errors.status}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                        labelId="status-label"
                        id="status"
                        value={form.status}
                        label="Status"
                        name="status"
                        onChange={handleSimpleSelectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {statusList.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.status && (
                        <Typography color="error" variant="caption">
                            {errors.status}
                        </Typography>
                    )}
                </FormControl> */}

                {/* ENGAGEMENT SCORE */}
                <FormControl fullWidth error={!!errors.engagement_score}>
                    <InputLabel id="engagement-score-label">Engagement Score</InputLabel>
                    <Select
                        labelId="engagement-score-label"
                        id="engagement-score"
                        value={form.engagement_score}
                        label="Engagement Score"
                        name="engagement_score"
                        onChange={handleSimpleSelectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {engagement_scoreList.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.engagement_score && (
                        <Typography color="error" variant="caption">
                            {errors.engagement_score}
                        </Typography>
                    )}
                </FormControl>

                {/* LIFECYCLE STAGE */}
                <FormControl fullWidth error={!!errors.lifecycle_stage}>
                    <InputLabel id="lifecycle-stage-label">Lifecycle Stage</InputLabel>
                    <Select
                        labelId="lifecycle-stage-label"
                        id="lifecycle-stage"
                        value={form.lifecycle_stage}
                        label="Lifecycle Stage"
                        name="lifecycle_stage"
                        onChange={handleSimpleSelectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {lifecycle_stageList.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.lifecycle_stage && (
                        <Typography color="error" variant="caption">
                            {errors.lifecycle_stage}
                        </Typography>
                    )}
                </FormControl>

                {/* PAYMENT BEHAVIOR */}
                <FormControl fullWidth error={!!errors.payment_behavior}>
                    <InputLabel id="payment-behavior-label">Payment Behavior</InputLabel>
                    <Select
                        labelId="payment-behavior-label"
                        id="payment-behavior"
                        value={form.payment_behavior}
                        label="Payment Behavior"
                        name="payment_behavior"
                        onChange={handleSimpleSelectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {payment_behaviorList.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.payment_behavior && (
                        <Typography color="error" variant="caption">
                            {errors.payment_behavior}
                        </Typography>
                    )}
                </FormControl>

                {/* SUBMIT BUTTON */}
                <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{
                        gridColumn: { xs: "auto", md: "span 2" },
                        mt: 3,
                    }}
                >
                    {isUpdateCustomer ? "Update" : "Create"}
                </Button>
            </Box>
        </Box>
    );
}