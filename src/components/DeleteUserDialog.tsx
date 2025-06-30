
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserProfile, useDeleteUser } from '@/hooks/useUsers'

interface DeleteUserDialogProps {
  user: UserProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const deleteUserMutation = useDeleteUser()

  const handleDelete = async () => {
    if (!user) return

    try {
      await deleteUserMutation.mutateAsync(user.id)
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  if (!user) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário <strong>{user.name}</strong>?
            Esta ação não pode ser desfeita e todos os dados do usuário serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUserMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
