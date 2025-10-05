"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function EditPetPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    medical_conditions: "",
    reward: "",
    is_active: true,
  });

  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPet = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session?.user) {
          router.replace("/auth/login");
          return;
        }

        setUserId(session.user.id);

        // Obtener datos de la mascota
        const { data: petData, error: petError } = await supabase
          .from("pets")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", session.user.id)
          .single();

        if (!mounted) return;

        if (petError || !petData) {
          setError("Mascota no encontrada o sin permisos");
          setTimeout(() => {
            if (mounted) router.replace("/dashboard");
          }, 2000);
          return;
        }

        setFormData({
          name: petData.name || "",
          breed: petData.breed || "",
          age: petData.age || "",
          medical_conditions: petData.medical_conditions || "",
          reward: petData.reward || "",
          is_active: petData.is_active,
        });
        setCurrentPhotoUrl(petData.photo_url);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching pet:", error);
        if (mounted) {
          setError("Error al cargar la información");
          setTimeout(() => router.replace("/dashboard"), 2000);
        }
      }
    };

    if (params.id) {
      fetchPet();
    }

    return () => {
      mounted = false;
    };
  }, [params.id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleActive = () => {
    setFormData({
      ...formData,
      is_active: !formData.is_active,
    });
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        reject("Solo se permiten archivos JPG, PNG o WEBP");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        reject(
          `El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
        return;
      }

      const img = new window.Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);

        if (img.width > 4000 || img.height > 4000) {
          reject("La imagen es muy grande. Máximo 4000x4000 píxeles");
          return;
        }

        if (img.width < 200 || img.height < 200) {
          reject("La imagen es muy pequeña. Mínimo 200x200 píxeles");
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        reject("Error al cargar la imagen");
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError("");

    if (!file) return;

    try {
      await validateImage(file);
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setImageError(error);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeCurrentImage = async () => {
    if (!window.confirm("¿Estás seguro de eliminar la foto actual?")) return;

    try {
      const { error } = await supabase
        .from("pets")
        .update({ photo_url: null })
        .eq("id", params.id)
        .eq("user_id", userId);

      if (error) throw error;

      setCurrentPhotoUrl(null);
      setSuccessMessage("Foto eliminada correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError("Error al eliminar la foto: " + error.message);
    }
  };

  const uploadImage = async (petId: string): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${userId}/${petId}-${Date.now()}.${fileExt}`;

      setUploadProgress(30);

      const { data, error } = await supabase.storage
        .from("pet-photos")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      setUploadProgress(60);

      const {
        data: { publicUrl },
      } = supabase.storage.from("pet-photos").getPublicUrl(fileName);

      setUploadProgress(100);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw new Error("Error al subir la imagen: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");
    setUploadProgress(0);

    try {
      setUploadProgress(10);

      let photoUrl = currentPhotoUrl;

      if (imageFile) {
        photoUrl = await uploadImage(params.id as string);
      }

      const { error: updateError } = await supabase
        .from("pets")
        .update({
          ...formData,
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setSuccessMessage("Mascota actualizada correctamente");
      setImageFile(null);
      setImagePreview(null);
      if (photoUrl) setCurrentPhotoUrl(photoUrl);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Error al actualizar mascota");
      setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
          </div>
          <p className="mt-6 text-slate-700 text-lg font-semibold">
            Cargando información...
          </p>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="mb-6 text-8xl">🔒</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Error al cargar
          </h2>
          <p className="text-slate-600 mb-6 text-lg">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">✏️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Editar mascota
                  </h2>
                  <p className="text-slate-600">
                    Actualiza la información de {formData.name}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Active Status Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">
                    {formData.is_active ? "✅" : "⏸️"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Estado del perfil
                  </h3>
                  <p className="text-sm text-slate-600">
                    {formData.is_active
                      ? "El perfil está activo y visible"
                      : "El perfil está desactivado"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  formData.is_active ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Photo Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📸</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Foto de la mascota
              </h3>
            </div>

            {currentPhotoUrl && !imagePreview && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Foto actual
                </p>
                <div className="relative rounded-2xl overflow-hidden shadow-lg inline-block">
                  <img
                    src={currentPhotoUrl}
                    alt="Foto actual"
                    className="w-64 h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeCurrentImage}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {imagePreview ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-700">
                  Nueva foto
                </p>
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-96 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-5xl">📷</span>
                </div>
                <p className="text-lg font-semibold text-slate-800 mb-2">
                  {currentPhotoUrl ? "Cambiar foto" : "Subir nueva foto"}
                </p>
                <p className="text-sm text-slate-500">
                  JPG, PNG o WEBP • Máximo 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {imageError && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">
                  {imageError}
                </p>
              </div>
            )}
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Información básica
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor="breed"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Raza
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Edad
                </label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Medical & Reward Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">⚕️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Información adicional
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="medical_conditions"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Condiciones médicas importantes
                </label>
                <textarea
                  id="medical_conditions"
                  name="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor="reward"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Recompensa
                </label>
                <input
                  type="text"
                  id="reward"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {saving && uploadProgress > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-blue-900">
                  {uploadProgress < 30
                    ? "Actualizando información..."
                    : uploadProgress < 100
                    ? "Subiendo nueva imagen..."
                    : "Completado"}
                </span>
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-xl">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-50 rounded-3xl shadow-sm border border-emerald-200 p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 mb-1">
                    Éxito
                  </h4>
                  <p className="text-sm text-emerald-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && formData.name && (
            <div className="bg-red-50 rounded-3xl shadow-sm border border-red-200 p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="text-sm font-bold text-red-900 mb-1">Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="px-10 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}