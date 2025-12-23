'use client';

import { UploadPurpose, getPresignedUrl } from '@/lib/upload/upload.actions';
import { DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Upload, message, theme } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';

interface ImageUploaderProps {
	value?: string;
	onChange?: (url: string | null) => void;
	purpose: UploadPurpose;
	shape?: 'rect' | 'circle';
	aspectRatio?: number; // e.g., 1 or 16/9. Not fully enforced on resize yet, but good for display.
	height?: number | string;
	width?: number | string;
	className?: string;
	disabled?: boolean;
}

const { useToken } = theme;

const ImageUploader: React.FC<ImageUploaderProps> = ({
	value,
	onChange,
	purpose,
	shape = 'rect',
	height = 120,
	width = 120,
	className,
	disabled = false,
}) => {
	const { token } = useToken();
	const t = useTranslations('Common');
	const [loading, setLoading] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);

	const handlePreview = async () => {
		if (value) {
			setPreviewOpen(true);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange?.(null);
	};

	const customRequest: UploadProps['customRequest'] = async (options) => {
		const { file, onSuccess, onError } = options;
		const fileObj = file as File;

		setLoading(true);
		try {
			// 1. Get Presigned URL
			const {
				success,
				url: uploadUrl,
				publicUrl,
				error,
			} = await getPresignedUrl(fileObj.type, purpose);

			if (!success || !uploadUrl || !publicUrl) {
				throw new Error(error || t('error') || 'Failed to get upload URL');
			}

			// 2. Upload to GCS
			const response = await fetch(uploadUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': fileObj.type,
				},
				body: fileObj,
			});

			if (!response.ok) {
				throw new Error(t('error') || 'Upload to storage failed');
			}

			// 3. Success
			onSuccess?.(publicUrl);
			onChange?.(publicUrl);
			message.success(t('saveSuccess') || 'Image uploaded successfully');
		} catch (err) {
			console.error(err);
			const msg = err instanceof Error ? err.message : t('error') || 'Upload failed';
			onError?.(new Error(msg));
			message.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const beforeUpload = (file: File) => {
		const isImage = file.type.startsWith('image/');
		if (!isImage) {
			message.error(t('errorImageOnly') || 'You can only upload image files!');
		}
		const isLt5M = file.size / 1024 / 1024 < 5;
		if (!isLt5M) {
			message.error(t('errorImageSize') || 'Image must be smaller than 5MB!');
		}
		return isImage && isLt5M;
	};

	const uploadButton = (
		<button style={{ border: 0, background: 'none', color: token.colorText }} type="button">
			{loading ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>{t('upload') || 'Upload'}</div>
		</button>
	);

	return (
		<div className={className}>
			<Upload
				name="image"
				listType="picture-card"
				className={`image-uploader ${shape === 'circle' ? 'avatar-uploader' : ''}`}
				showUploadList={false}
				customRequest={customRequest}
				beforeUpload={beforeUpload}
				disabled={disabled}
				accept="image/*"
				style={{
					width: typeof width === 'number' ? width : undefined,
					height: typeof height === 'number' ? height : undefined,
				}}
			>
				{value ? (
					<div
						className="uploaded-image-container"
						style={{
							position: 'relative',
							width: '100%',
							height: '100%',
							borderRadius: shape === 'circle' ? '50%' : '8px',
							overflow: 'hidden',
						}}
					>
						{/* Use standard img tag for simplicity with external URLs without configuring next.config.js domains everywhere, 
                 or generic Next Image with unoptimized if uncertain. Given user prompt constraints, let's use img for MVP safety. */}
						<img
							src={value}
							alt="Uploaded"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
						{!disabled && (
							<div
								className="overlay-actions"
								style={{
									position: 'absolute',
									inset: 0,
									background: 'rgba(0,0,0,0.5)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									opacity: 0,
									transition: 'opacity 0.2s',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.opacity = '1';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.opacity = '0';
								}}
							>
								<Button
									shape="circle"
									icon={<DeleteOutlined />}
									danger
									size="small"
									onClick={handleRemove}
								/>
							</div>
						)}
					</div>
				) : (
					uploadButton
				)}
			</Upload>
			<Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
				<img alt="preview" style={{ width: '100%' }} src={value} />
			</Modal>
			<style jsx global>{`
				.avatar-uploader .ant-upload {
					border-radius: 50% !important;
					overflow: hidden;
				}
				.image-uploader .ant-upload {
					background: ${token.colorFillQuaternary} !important;
					border-color: ${token.colorBorderSecondary} !important;
				}
			`}</style>
		</div>
	);
};

export default ImageUploader;
